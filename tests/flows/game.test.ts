import { DB } from '@neogroup/neorm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { Map as GameMap } from '@/app/(protected)/(game)/models/Map'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import { classicMode } from '@/app/(protected)/(game)/services/classicMode'
import { cleanupGames, GAME_RETENTION_MS, LOBBY_MAX_AGE_MS } from '@/app/(protected)/(game)/services/gameCleanup'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { createGame, getGame, getGames, getPlayerStats, sendGameAction } from '@/app/(protected)/(game)/services/games'
import {
  findLiveLocation,
  getSearchRadii,
  LARGE_AREA_SEARCH_RADII_METERS,
  MAX_CACHED_LOCATIONS_PER_PLACE,
  SEARCH_RADII_METERS
} from '@/app/(protected)/(game)/services/locations'
import { getMapPlaces, getMaps } from '@/app/(protected)/(game)/services/maps'
import { ROUND_TIME_GRACE_MS } from '@/app/(protected)/(game)/utils/guesses'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const ATLANTIC = { latitude: 0, longitude: -30 }
const THREE_MINUTES_MS = 3 * 60 * 1000
const START = new Date('2026-01-01T10:00:00Z')

function after(ms: number): () => Date {
  return () => new Date(START.getTime() + ms)
}

function classic(game: GameView): ClassicGameView {
  return game.modeView as ClassicGameView
}

describe('classic game flow', () => {
  let userId: number
  let mapId: number
  const originalSettings = classicMode.definition.settings

  afterEach(() => {
    classicMode.definition.settings = originalSettings
  })

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
    mapId = (await getMaps())[0].id
  })

  function create(options: GameOptions = {}, targetMapId = mapId): Promise<GameView> {
    return createGame(
      userId,
      { mapId: targetMapId, mode: GameMode.CLASSIC },
      { finder: new FakePanoramaFinder(), ...options }
    )
  }

  function act(gameId: number, action: GameAction, options: GameOptions = {}): Promise<GameView> {
    return sendGameAction(userId, { gameId, action }, options)
  }

  function guess(gameId: number, roundNumber: number, position: LatLng | null, options: GameOptions = {}) {
    return act(
      gameId,
      { type: 'guess', roundNumber, latitude: position?.latitude ?? null, longitude: position?.longitude ?? null },
      options
    )
  }

  /** The rounds of a game as stored in the database (with the answers). */
  async function answersOf(gameId: number): Promise<GameRound[]> {
    return ((await Game.find(gameId))!.data as ClassicGameData).rounds
  }

  /** Starts the current round and guesses it (the normal flow of a timed game). */
  async function play(gameId: number, position: LatLng | null): Promise<GameView> {
    const started = await act(gameId, { type: 'startRound' })

    return guess(gameId, classic(started).currentRoundNumber!, position)
  }

  /** Creates a map with the Argentinian cities (optionally with its own score scale). */
  async function createArgentinaMap(scoreMaxDistanceKm: number | null = null, withPlaces = true): Promise<number> {
    await DB.table('maps').insert({
      name: 'Ciudades argentinas',
      description: 'Solo Argentina',
      settings: scoreMaxDistanceKm == null ? null : JSON.stringify({ scoreMaxDistanceKm }),
      enabled: true
    })

    const argentinaId = Number((await DB.table('maps').where('name', 'Ciudades argentinas').first())!.id)
    // The Argentinian cities (not the whole country, the place of the "Argentina" map).
    const places = (await Place.where('countryCode', 'AR').get()).filter((place) => place.name !== 'Argentina')

    if (withPlaces) {
      await DB.table('map_places').insert(places.map((place) => ({ mapId: argentinaId, placeId: place.id })))
    }

    return argentinaId
  }

  it('seeds the city maps and the country maps', async () => {
    const maps = await getMaps()

    expect(maps.map((map) => [map.name, map.placesCount])).toEqual([
      ['Ciudades famosas', 20],
      ['Ciudades del mundo', 150],
      ['Lugares icónicos', 582],
      ['Argentina', 1],
      ['España', 1],
      ['Estados Unidos', 1],
      ['Latinoamérica', 105],
      ['Europa', 213]
    ])

    // No seeded map overrides the settings of the game modes.
    for (const map of maps) {
      expect((await GameMap.find(map.id))!.settings).toBeNull()
    }

    const famous = await getMapPlaces(mapId)
    const world = await getMapPlaces(maps[1].id)

    expect(famous.filter((place) => place.geometry.type === 'Polygon')).toHaveLength(3)
    expect(famous.map((place) => place.name)).toEqual(expect.arrayContaining(['París', 'Roma', 'Buenos Aires']))
    // Not famous: only in "Ciudades del mundo".
    expect(famous.map((place) => place.name)).not.toContain('Mendoza')
    expect(world.find((place) => place.name === 'Mendoza')?.geometry).toEqual({
      type: 'Point',
      coordinates: [-68.8458, -32.8895],
      radius: 5000
    })
    // Every famous city is also a city of the world (the same place, linked to both maps).
    expect(famous.every((place) => world.some((other) => other.id === place.id))).toBe(true)
    expect(new Set(world.map((place) => place.countryCode)).size).toBe(36)
    // A country map has a single place: the whole country (not part of "Ciudades del mundo").
    expect(world.map((place) => place.name)).not.toContain('Argentina')
  })

  it('seeds the regional maps and the landmarks without touching "Ciudades del mundo"', async () => {
    const maps = await getMaps()
    const placesOf = async (name: string) => getMapPlaces(maps.find((map) => map.name === name)!.id)
    const world = await getMapPlaces(maps[1].id)
    const worldIds = new Set(world.map((place) => place.id))
    const latinAmerica = await placesOf('Latinoamérica')
    const europe = await placesOf('Europa')
    const landmarks = await placesOf('Lugares icónicos')

    // The world cities of the region are shared with "Ciudades del mundo"; the rest are only in the regional map.
    expect(latinAmerica.map((place) => place.name)).toEqual(expect.arrayContaining(['Buenos Aires', 'Quito', 'La Paz']))
    expect(latinAmerica.filter((place) => worldIds.has(place.id))).toHaveLength(36)
    expect(latinAmerica.map((place) => place.name)).not.toContain('Madrid')
    expect(europe.map((place) => place.name)).toEqual(expect.arrayContaining(['París', 'Madrid', 'Bucarest']))
    expect(europe.filter((place) => worldIds.has(place.id)).length).toBeGreaterThan(70)
    expect(europe.map((place) => place.name)).not.toContain('Mendoza')
    // The country maps are not part of the regional ones.
    expect([...latinAmerica, ...europe].map((place) => place.name)).not.toEqual(expect.arrayContaining(['Argentina']))

    // Hundreds of landmarks, none of them a city of the world.
    expect(landmarks.length).toBeGreaterThan(500)
    expect(landmarks.some((place) => worldIds.has(place.id))).toBe(false)
    expect(landmarks.map((place) => place.name)).toEqual(expect.arrayContaining(['Torre Eiffel', 'Machu Picchu']))
    expect(new Set(landmarks.map((place) => place.countryCode)).size).toBeGreaterThan(50)
  })

  it('plays a country map anywhere in the country, with searches sized for it', async () => {
    const argentina = (await getMaps()).find((map) => map.name === 'Argentina')!
    const [country] = await getMapPlaces(argentina.id)
    const finder = new FakePanoramaFinder()
    const game = await create({ finder }, argentina.id)
    const answers = await answersOf(game.id)

    expect(getSearchRadii(country)).toBe(LARGE_AREA_SEARCH_RADII_METERS)
    expect(answers).toHaveLength(5)
    expect(new Set(answers.map((round) => round.panoId)).size).toBe(5)
    expect(answers.every((round) => round.placeName === 'Argentina' && round.countryCode === 'AR')).toBe(true)
    // The random points are spread over the country, not around a single spot.
    expect(
      Math.max(...answers.map((round) => round.latitude)) - Math.min(...answers.map((round) => round.latitude))
    ).toBeGreaterThan(1)

    // 100 km off, with the score scale of the mode (2.000 km).
    await act(game.id, { type: 'startRound' })

    const result = classic(
      await guess(game.id, 1, { latitude: answers[0].latitude + 0.9, longitude: answers[0].longitude })
    )

    expect(result.rounds[0].distanceMeters).toBeGreaterThan(95_000)
    expect(result.rounds[0].score).toBeGreaterThan(3000)
  })

  it('offers the game modes of the main menu, each one with its fixed rules', () => {
    expect(getGameModes()).toEqual([
      expect.objectContaining({
        mode: GameMode.CLASSIC,
        slug: 'classic',
        name: 'Clásico',
        minPlayers: 1,
        maxPlayers: 1,
        settings: { rounds: 5, timeLimitSeconds: 180, scoreMaxDistanceKm: 3000 }
      }),
      expect.objectContaining({
        mode: GameMode.CLASSIC_MULTIPLAYER,
        slug: 'friends',
        name: 'Partida Clásica',
        minPlayers: 2,
        maxPlayers: 8,
        settings: {
          rounds: 5,
          timeLimitSeconds: 180,
          maxPlayers: 8,
          revealSeconds: 15,
          countdownSeconds: 3,
          scoreMaxDistanceKm: 3000
        }
      }),
      expect.objectContaining({
        mode: GameMode.BATTLE_ROYALE,
        slug: 'battle-royale',
        name: 'Battle Royale',
        minPlayers: 3,
        maxPlayers: 8,
        settings: {
          timeLimitSeconds: 180,
          maxPlayers: 8,
          revealSeconds: 15,
          countdownSeconds: 3,
          scoreMaxDistanceKm: 3000
        }
      })
    ])
  })

  it('starts a game with one round per place, hiding the answers', async () => {
    const game = await create()

    expect(game).toMatchObject({
      mode: GameMode.CLASSIC,
      status: GameStatus.IN_PROGRESS,
      mapName: 'Ciudades famosas',
      code: null,
      hostUserId: null,
      version: 1
    })
    expect(game.players).toEqual([{ userId, name: 'Player', status: 1, score: 0, position: null, outcome: null }])
    expect(classic(game)).toMatchObject({
      roundsCount: 5,
      currentRoundNumber: 1,
      timeLimitSeconds: 180,
      roundTimeLeftMs: null,
      totalScore: 0,
      maxScore: 25000
    })

    const { rounds } = classic(game)

    expect(new Set(rounds.map((round) => round.panoId)).size).toBe(5)
    expect(rounds.every((round) => round.location === null && round.placeName === null)).toBe(true)
    expect(JSON.stringify(game)).not.toContain(String((await answersOf(game.id))[0].latitude))
    expect(await Game.count()).toBe(1)
    expect(await GamePlayer.count()).toBe(1)
  })

  it('only uses the places linked to the map, with the rules of the mode', async () => {
    const argentinaId = await createArgentinaMap()

    expect((await getMaps()).find((map) => map.name === 'Ciudades argentinas')).toMatchObject({ placesCount: 38 })

    const game = await create({}, argentinaId)

    expect(classic(game)).toMatchObject({ roundsCount: 5, timeLimitSeconds: 180 })
    expect((await answersOf(game.id)).map((round) => round.countryCode)).toEqual(['AR', 'AR', 'AR', 'AR', 'AR'])
    expect((await Game.find(game.id))!.data).toMatchObject({ settings: { scoreMaxDistanceKm: 3000 } })
  })

  it('lets a map override only the score scale of the mode', async () => {
    const argentinaId = await createArgentinaMap(1234)
    const game = await create({}, argentinaId)

    expect((await Game.find(game.id))!.data).toMatchObject({
      settings: { rounds: 5, timeLimitSeconds: 180, scoreMaxDistanceKm: 1234 }
    })
  })

  it('does not offer maps without places, nor unknown game modes', async () => {
    const emptyId = await createArgentinaMap(null, false)

    expect((await getMaps()).map((map) => map.name)).not.toContain('Ciudades argentinas')
    await expect(create({}, emptyId)).rejects.toThrow('no tiene lugares')
    await expect(
      createGame(userId, { mapId, mode: 99 as GameMode }, { finder: new FakePanoramaFinder() })
    ).rejects.toThrow('Modo de juego no disponible')
  })

  it('plays the 5 rounds and finishes with the sum of the scores', async () => {
    const game = await create()
    const answers = await answersOf(game.id)
    let view = game

    for (let index = 0; index < 5; index++) {
      // Guess 1: exactly on the spot; the rest, in the middle of the Atlantic.
      view = await play(game.id, index === 0 ? answers[0] : ATLANTIC)

      const round = classic(view).rounds[index]

      expect(round.guessed).toBe(true)
      expect(round.timedOut).toBe(false)
      expect(round.location).toEqual({ latitude: answers[index].latitude, longitude: answers[index].longitude })
      expect(round.placeName).toBe(answers[index].placeName)
    }

    const { totalScore, rounds, currentRoundNumber } = classic(view)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(view.finishedAt).not.toBeNull()
    expect(currentRoundNumber).toBeNull()
    expect(rounds[0].score).toBe(5000)
    expect(totalScore).toBe(rounds.reduce((total, round) => total + (round.score ?? 0), 0))
    // The final result is stored with the player (history and stats).
    expect(view.players[0]).toMatchObject({ score: totalScore, position: 1, outcome: null })
    expect(await getPlayerStats(userId)).toEqual({ gamesPlayed: 1, bestScore: totalScore, averageScore: totalScore })
    await expect(guess(game.id, 5, ATLANTIC)).rejects.toThrow('La partida ya terminó')
  })

  it('can be resumed from any device: the state lives in the server', async () => {
    const game = await create()

    await play(game.id, ATLANTIC)

    const result = await getGame(userId, { gameId: game.id })

    expect(result.unchanged).toBe(false)

    if (!result.unchanged) {
      expect(classic(result.game).currentRoundNumber).toBe(2)
      expect(classic(result.game).rounds[0].guessed).toBe(true)
    }
  })

  it('answers "unchanged" when the client already has the current version', async () => {
    const game = await create()

    expect(await getGame(userId, { gameId: game.id, sinceVersion: game.version })).toEqual({ unchanged: true })

    const started = await act(game.id, { type: 'startRound' })

    expect(started.version).toBe(game.version + 1)
    expect((await getGame(userId, { gameId: game.id, sinceVersion: game.version })).unchanged).toBe(false)
    // Starting an already started round changes nothing, so nothing is written.
    expect((await act(game.id, { type: 'startRound' })).version).toBe(started.version)
  })

  describe('round time limit', () => {
    it('requires the round to be started before guessing', async () => {
      const game = await create()

      await expect(guess(game.id, 1, ATLANTIC)).rejects.toThrow('no empezó')
    })

    it('keeps the original start time when the round is started again (reloading gives no extra time)', async () => {
      const game = await create({ now: after(0) })
      const first = await act(game.id, { type: 'startRound' }, { now: after(0) })
      const later = await act(game.id, { type: 'startRound' }, { now: after(30_000) })

      expect(classic(first).roundTimeLeftMs).toBe(THREE_MINUTES_MS)
      expect(classic(later).roundTimeLeftMs).toBe(THREE_MINUTES_MS - 30_000)
    })

    it('accepts a guess sent right at the end of the countdown (grace period)', async () => {
      const game = await create({ now: after(0) })
      const [answer] = await answersOf(game.id)

      await act(game.id, { type: 'startRound' }, { now: after(0) })

      const result = await guess(game.id, 1, answer, { now: after(THREE_MINUTES_MS + ROUND_TIME_GRACE_MS - 1000) })

      expect(classic(result).rounds[0]).toMatchObject({ score: 5000, timedOut: false })
    })

    it('scores 0 a guess that arrives after the time limit', async () => {
      const game = await create({ now: after(0) })
      const [answer] = await answersOf(game.id)

      await act(game.id, { type: 'startRound' }, { now: after(0) })

      const result = classic(
        await guess(game.id, 1, answer, { now: after(THREE_MINUTES_MS + ROUND_TIME_GRACE_MS + 1000) })
      )

      expect(result.rounds[0]).toMatchObject({ score: 0, timedOut: true, guess: null, distanceMeters: null })
      expect(result.rounds[0].location).not.toBeNull()
      expect(result.currentRoundNumber).toBe(2)
      // The next round has not started yet: its clock starts when it is shown.
      expect(result.roundTimeLeftMs).toBeNull()
    })

    it('scores 0 a round where the time ran out without a pin', async () => {
      const game = await create()

      expect(classic(await play(game.id, null)).rounds[0]).toMatchObject({ score: 0, timedOut: true, guess: null })
    })

    it('has no clock for a mode without time limit', async () => {
      classicMode.definition.settings = { ...classicMode.definition.settings, timeLimitSeconds: null }

      const game = await create()

      expect(classic(game).timeLimitSeconds).toBeNull()
      expect(classic(await act(game.id, { type: 'startRound' })).roundTimeLeftMs).toBeNull()
      await expect(guess(game.id, 1, null)).rejects.toThrow('Marcá un lugar')
      expect(classic(await guess(game.id, 1, ATLANTIC)).rounds[0].timedOut).toBe(false)
    })
  })

  it('scores each round only once', async () => {
    const game = await create()
    const [answer] = await answersOf(game.id)

    await play(game.id, ATLANTIC)

    // The same round again, now knowing the answer.
    await expect(guess(game.id, 1, answer)).rejects.toThrow('Esa ronda ya fue jugada')
  })

  it('only lets the players of a game see it or play it', async () => {
    const game = await create()
    const otherUserId = await createUser('other@geoquests.test')

    await expect(getGame(otherUserId, { gameId: game.id })).rejects.toThrow('Partida no encontrada')
    await expect(sendGameAction(otherUserId, { gameId: game.id, action: { type: 'startRound' } })).rejects.toThrow(
      'Partida no encontrada'
    )
    await expect(getGame(userId, { gameId: 999 })).rejects.toThrow('Partida no encontrada')
  })

  it('rejects unknown actions and invalid positions', async () => {
    const game = await create()

    await expect(act(game.id, { type: 'fly' } as unknown as GameAction)).rejects.toThrow('Acción no válida')
    await expect(sendGameAction(userId, { gameId: game.id, action: null as unknown as GameAction })).rejects.toThrow(
      'Acción no válida'
    )
    await act(game.id, { type: 'startRound' })
    await expect(guess(game.id, 1, { latitude: 120, longitude: 0 })).rejects.toThrow('Posición inválida')
  })

  it('lists the games of the player, newest first, a page at a time', async () => {
    const first = await create()

    await play(first.id, ATLANTIC)

    for (let index = 0; index < 2; index++) {
      await create()
    }

    const firstPage = await getGames(userId, 0, 2)
    const secondPage = await getGames(userId, 2, 2)

    expect(firstPage.items).toHaveLength(2)
    expect(firstPage.hasMore).toBe(true)
    expect(firstPage.items[0].id).toBeGreaterThan(firstPage.items[1].id)
    expect(firstPage.items[0]).toMatchObject({
      mode: GameMode.CLASSIC,
      mapName: 'Ciudades famosas',
      status: GameStatus.IN_PROGRESS,
      playersCount: 1,
      maxScore: 25000,
      completedSteps: 0,
      totalSteps: 5
    })
    expect(secondPage).toMatchObject({ hasMore: false })
    expect(secondPage.items).toEqual([expect.objectContaining({ id: first.id, completedSteps: 1 })])
  })

  it('deletes classic games abandoned for more than a day and lobbies nobody started', async () => {
    const game = await create()
    const now = new Date()

    await DB.table('games').insert({
      mode: GameMode.CLASSIC_MULTIPLAYER,
      mapId,
      status: GameStatus.LOBBY,
      code: 'ABCDEF',
      hostUserId: userId,
      version: 1,
      data: '{}',
      createdAt: new Date(now.getTime() - LOBBY_MAX_AGE_MS - 1000),
      updatedAt: now
    })

    const context = { now, random: Math.random, finder: new FakePanoramaFinder() }

    // Nothing old enough yet besides the lobby.
    expect(await cleanupGames(context)).toBe(1)
    expect(await Game.count()).toBe(1)

    await DB.table('games')
      .where('id', game.id)
      .update({ updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) })
    expect(await cleanupGames(context)).toBe(1)
    expect(await Game.count()).toBe(0)
    expect(await GamePlayer.count()).toBe(0)
  })

  it('deletes the games (and their players) older than the retention period', async () => {
    const now = new Date()
    const game = await create()

    await DB.table('games').where('id', game.id).update({ status: GameStatus.FINISHED, finishedAt: now })
    const context = { now, random: Math.random, finder: new FakePanoramaFinder() }

    // Recent finished games are kept.
    expect(await cleanupGames(context)).toBe(0)
    expect(await Game.count()).toBe(1)

    await DB.table('games')
      .where('id', game.id)
      .update({ createdAt: new Date(now.getTime() - GAME_RETENTION_MS - 1000) })
    expect(await cleanupGames(context)).toBe(1)
    expect(await Game.count()).toBe(0)
    expect(await GamePlayer.count()).toBe(0)
  })

  /** Fills the fallback cache of every place with one "cached-<placeId>" location. */
  async function fillCache() {
    const places = await getMapPlaces(mapId)

    await DB.table('place_locations').insert(
      places.map((place) => {
        const [longitude, latitude] =
          place.geometry.type === 'Point' ? place.geometry.coordinates : place.geometry.coordinates[0][0]

        return { placeId: place.id, panoId: `cached-${place.id}`, latitude, longitude }
      })
    )
  }

  it('uses live panoramas first, even when the cache is full', async () => {
    await fillCache()

    const game = await create()

    expect(classic(game).rounds.every((round) => round.panoId.startsWith('pano-'))).toBe(true)
  })

  it('skips a place without live coverage for another place instead of using the cache', async () => {
    await fillCache()

    // No coverage anywhere in the southern hemisphere.
    const finder = new FakePanoramaFinder((point) => (point.latitude < 0 ? 'empty' : 'found'))
    const game = await create({ finder })

    expect(classic(game).rounds.every((round) => round.panoId.startsWith('pano-'))).toBe(true)
    expect((await answersOf(game.id)).every((round) => round.latitude > 0)).toBe(true)
  })

  it('widens the search radius on every attempt', async () => {
    const [place] = await getMapPlaces(mapId)
    const finder = new FakePanoramaFinder('empty')

    expect((await findLiveLocation(place, finder)).panorama).toBeNull()
    expect(finder.calls.map((call) => call.radius)).toEqual(SEARCH_RADII_METERS)
  })

  it('uses the cache only as a last resort, when Street View is failing', async () => {
    await fillCache()

    const { rounds } = classic(await create({ finder: new FakePanoramaFinder('error') }))

    expect(rounds).toHaveLength(5)
    expect(rounds.every((round) => round.panoId.startsWith('cached-'))).toBe(true)
    expect(new Set(rounds.map((round) => round.panoId)).size).toBe(5)
  })

  it('keeps the cache of each place bounded but rotating', async () => {
    const [place] = await getMapPlaces(mapId)

    await DB.table('place_locations').insert(
      Array.from({ length: MAX_CACHED_LOCATIONS_PER_PLACE }, (_, index) => ({
        placeId: place.id,
        panoId: `old-${index}`,
        latitude: 0,
        longitude: 0
      }))
    )

    const { panorama } = await findLiveLocation(place, new FakePanoramaFinder())

    expect(await PlaceLocation.where('placeId', place.id).count()).toBe(MAX_CACHED_LOCATIONS_PER_PLACE)
    expect(await PlaceLocation.where('panoId', panorama!.id).first()).not.toBeNull()
  })

  it('fails with a clear message when no imagery is available at all', async () => {
    await expect(create({ finder: new FakePanoramaFinder('empty') })).rejects.toThrow('No pudimos encontrar imágenes')
    expect(await Game.count()).toBe(0)
  })

  it('rejects unknown or disabled maps', async () => {
    await expect(create({}, 999)).rejects.toThrow('no encontrado')
    await DB.table('maps').where('id', mapId).update({ enabled: false })
    await expect(create()).rejects.toThrow('no encontrado')
  })
})
