import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameSession } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import {
  deleteAbandonedGames,
  getGame,
  getGameResult,
  getGames,
  ROUND_TIME_GRACE_MS,
  startGame,
  startRound,
  submitGuess
} from '@/app/(protected)/(game)/services/games'
import { decryptGameState } from '@/app/(protected)/(game)/services/gameTokens'
import {
  findLiveLocation,
  MAX_CACHED_LOCATIONS_PER_PLACE,
  SEARCH_RADII_METERS
} from '@/app/(protected)/(game)/services/locations'
import { getQuestPlaces, getQuests } from '@/app/(protected)/(game)/services/quests'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const ATLANTIC = { latitude: 0, longitude: -30 }
const TWO_MINUTES_MS = 2 * 60 * 1000

describe('game flow', () => {
  let userId: number
  let questId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
    questId = (await getQuests())[0].id
  })

  /** Starts the current round and guesses it (the normal flow of a timed quest). */
  async function play(session: GameSession, guess: LatLng | null): Promise<GameSession> {
    const started = await startRound(userId, session.token)

    return submitGuess(userId, {
      token: started.token,
      roundNumber: started.game.currentRoundNumber!,
      latitude: guess?.latitude ?? null,
      longitude: guess?.longitude ?? null
    })
  }

  it('seeds the "Ciudades del mundo" quest with its 20 cities', async () => {
    const quests = await getQuests()

    expect(quests).toHaveLength(1)
    expect(quests[0]).toMatchObject({
      name: 'Ciudades del mundo',
      rounds: 5,
      time: 120,
      image: '/quests/ciudades-del-mundo.png',
      placesCount: 20,
      maxScore: 25000
    })

    const places = await getQuestPlaces(questId)

    expect(places).toHaveLength(20)
    expect(places.filter((place) => place.geometry.type === 'Polygon')).toHaveLength(3)
    expect(places.find((place) => place.name === 'Mendoza')?.geometry).toEqual({
      type: 'Point',
      coordinates: [-68.8458, -32.8895],
      radius: 5000
    })
  })

  it('starts a game with one round per place, hiding the answers', async () => {
    const { game, token } = await startGame(userId, questId, { finder: new FakePanoramaFinder() })

    expect(game).toMatchObject({
      status: GameStatus.IN_PROGRESS,
      questName: 'Ciudades del mundo',
      currentRoundNumber: 1,
      timeLimitSeconds: 120,
      roundTimeLeftMs: null
    })
    expect(game.rounds).toHaveLength(5)
    expect(new Set(game.rounds.map((round) => round.panoId)).size).toBe(5)
    expect(game.rounds.every((round) => round.location === null && round.placeName === null)).toBe(true)
    // The answers only travel inside the encrypted token, never in clear.
    expect(token).not.toContain(game.rounds[0].panoId)
    expect(decryptGameState(token).rounds[0].panoId).toBe(game.rounds[0].panoId)
    expect(await Game.count()).toBe(1)
  })

  it('only uses the places linked to the quest', async () => {
    await DB.table('quests').insert({ name: 'Argentina', description: 'Solo Argentina', rounds: 2, time: null })

    const argentina = (await DB.table('quests').where('name', 'Argentina').first())!
    const places = (await getQuestPlaces(questId)).filter((place) => place.countryCode === 'AR')

    // A quest with no places is not offered in the main menu.
    expect((await getQuests()).map((quest) => quest.name)).not.toContain('Argentina')
    await DB.table('quest_place').insert(places.map((place) => ({ questId: argentina.id, placeId: place.id })))
    expect((await getQuests()).find((quest) => quest.name === 'Argentina')?.placesCount).toBe(2)

    const session = await startGame(userId, Number(argentina.id), { finder: new FakePanoramaFinder() })

    expect(session.game.rounds).toHaveLength(2)
    expect(decryptGameState(session.token).rounds.map((round) => round.countryCode)).toEqual(['AR', 'AR'])
  })

  it('plays the 5 rounds and finishes with the sum of the scores', async () => {
    let session = await startGame(userId, questId, { finder: new FakePanoramaFinder() })
    const answers = decryptGameState(session.token).rounds

    for (let index = 0; index < 5; index++) {
      // Guess 1: exactly on the spot; the rest, in the middle of the Atlantic.
      session = await play(session, index === 0 ? answers[0] : ATLANTIC)

      const round = session.game.rounds[index]

      expect(round.guessed).toBe(true)
      expect(round.timedOut).toBe(false)
      expect(round.location).toEqual({ latitude: answers[index].latitude, longitude: answers[index].longitude })
      expect(round.placeName).toBe(answers[index].placeName)
    }

    const { game } = session

    expect(game.status).toBe(GameStatus.FINISHED)
    expect(game.currentRoundNumber).toBeNull()
    expect(game.rounds[0].score).toBe(5000)
    expect(game.totalScore).toBe(game.rounds.reduce((total, round) => total + (round.score ?? 0), 0))
    expect(await getGameResult(userId, game.id)).toMatchObject({
      questName: 'Ciudades del mundo',
      status: GameStatus.FINISHED,
      playedRounds: 5,
      totalScore: game.totalScore
    })
  })

  describe('round time limit', () => {
    it('requires the round to be started before guessing', async () => {
      const { token } = await startGame(userId, questId, { finder: new FakePanoramaFinder() })

      await expect(submitGuess(userId, { token, roundNumber: 1, ...ATLANTIC })).rejects.toThrow('no empezó')
    })

    it('keeps the original start time when the round is started again (reloading gives no extra time)', async () => {
      const start = new Date('2026-01-01T10:00:00Z')
      const { token } = await startGame(userId, questId, { finder: new FakePanoramaFinder(), now: () => start })
      const first = await startRound(userId, token, { now: () => start })
      const later = await startRound(userId, token, { now: () => new Date(start.getTime() + 30_000) })

      expect(first.game.roundTimeLeftMs).toBe(TWO_MINUTES_MS)
      expect(later.game.roundTimeLeftMs).toBe(TWO_MINUTES_MS - 30_000)
    })

    it('accepts a guess sent right at the end of the countdown (grace period)', async () => {
      const start = new Date('2026-01-01T10:00:00Z')
      const session = await startGame(userId, questId, { finder: new FakePanoramaFinder(), now: () => start })
      const started = await startRound(userId, session.token, { now: () => start })
      const answer = decryptGameState(started.token).rounds[0]
      const result = await submitGuess(
        userId,
        { token: started.token, roundNumber: 1, ...answer },
        { now: () => new Date(start.getTime() + TWO_MINUTES_MS + ROUND_TIME_GRACE_MS - 1000) }
      )

      expect(result.game.rounds[0]).toMatchObject({ score: 5000, timedOut: false })
    })

    it('scores 0 a guess that arrives after the time limit', async () => {
      const start = new Date('2026-01-01T10:00:00Z')
      const session = await startGame(userId, questId, { finder: new FakePanoramaFinder(), now: () => start })
      const started = await startRound(userId, session.token, { now: () => start })
      const answer = decryptGameState(started.token).rounds[0]
      const result = await submitGuess(
        userId,
        { token: started.token, roundNumber: 1, ...answer },
        { now: () => new Date(start.getTime() + TWO_MINUTES_MS + ROUND_TIME_GRACE_MS + 1000) }
      )

      expect(result.game.rounds[0]).toMatchObject({ score: 0, timedOut: true, guess: null, distanceMeters: null })
      expect(result.game.rounds[0].location).not.toBeNull()
      expect(result.game.currentRoundNumber).toBe(2)
      // The next round has not started yet: its clock starts when it is shown.
      expect(result.game.roundTimeLeftMs).toBeNull()
    })

    it('scores 0 a round where the time ran out without a pin', async () => {
      const session = await startGame(userId, questId, { finder: new FakePanoramaFinder() })
      const result = await play(session, null)

      expect(result.game.rounds[0]).toMatchObject({ score: 0, timedOut: true, guess: null })
    })

    it('has no clock for quests without time limit', async () => {
      await DB.table('quests').where('id', questId).update({ time: null })

      const session = await startGame(userId, questId, { finder: new FakePanoramaFinder() })

      expect(session.game.timeLimitSeconds).toBeNull()
      expect((await startRound(userId, session.token)).game.roundTimeLeftMs).toBeNull()
      await expect(
        submitGuess(userId, { token: session.token, roundNumber: 1, latitude: null, longitude: null })
      ).rejects.toThrow('Marcá un lugar')

      const result = await submitGuess(userId, { token: session.token, roundNumber: 1, ...ATLANTIC })

      expect(result.game.rounds[0].timedOut).toBe(false)
    })
  })

  it('rejects replaying an old token to guess a round again', async () => {
    const start = await startGame(userId, questId, { finder: new FakePanoramaFinder() })
    const started = await startRound(userId, start.token)
    const answer = decryptGameState(started.token).rounds[0]

    await submitGuess(userId, { token: started.token, roundNumber: 1, ...ATLANTIC })

    // Same (valid) token again, now knowing the answer.
    await expect(submitGuess(userId, { token: started.token, roundNumber: 1, ...answer })).rejects.toThrow(
      'desactualizada'
    )
    await expect(getGame(userId, started.token)).rejects.toThrow('desactualizada')
  })

  it('rejects tampered tokens and tokens of other users', async () => {
    const { token } = await startGame(userId, questId, { finder: new FakePanoramaFinder() })
    const otherUserId = await createUser('other@geoquests.test')
    const tampered = token.slice(0, -4) + (token.endsWith('AAAA') ? 'BBBB' : 'AAAA')

    await expect(getGame(userId, tampered)).rejects.toThrow('La partida no es válida')
    await expect(getGame(userId, 'not-a-token')).rejects.toThrow('La partida no es válida')
    await expect(getGame(otherUserId, token)).rejects.toThrow('Partida no encontrada')
    await expect(submitGuess(userId, { token, roundNumber: 2, ...ATLANTIC })).rejects.toThrow('Esa ronda ya fue jugada')
  })

  it('lists the games of the player, newest first, a page at a time', async () => {
    for (let index = 0; index < 3; index++) {
      await startGame(userId, questId, { finder: new FakePanoramaFinder() })
    }

    const firstPage = await getGames(userId, 0, 2)
    const secondPage = await getGames(userId, 2, 2)

    expect(firstPage.items).toHaveLength(2)
    expect(firstPage.hasMore).toBe(true)
    expect(firstPage.items[0].id).toBeGreaterThan(firstPage.items[1].id)
    expect(firstPage.items[0].questName).toBe('Ciudades del mundo')
    expect(secondPage).toMatchObject({ hasMore: false })
    expect(secondPage.items).toHaveLength(1)
  })

  it('deletes games abandoned for more than a day', async () => {
    const { game } = await startGame(userId, questId, { finder: new FakePanoramaFinder() })

    await DB.table('games')
      .where('id', game.id)
      .update({ createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) })
    expect(await deleteAbandonedGames()).toBe(1)
    expect(await Game.count()).toBe(0)
  })

  /** Fills the fallback cache of every place with one "cached-<placeId>" location. */
  async function fillCache() {
    const places = await getQuestPlaces(questId)

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

    const { game } = await startGame(userId, questId, { finder: new FakePanoramaFinder() })

    expect(game.rounds.every((round) => round.panoId.startsWith('pano-'))).toBe(true)
  })

  it('skips a place without live coverage for another place instead of using the cache', async () => {
    await fillCache()

    // No coverage anywhere in the southern hemisphere.
    const finder = new FakePanoramaFinder((point) => (point.latitude < 0 ? 'empty' : 'found'))
    const session = await startGame(userId, questId, { finder })

    expect(session.game.rounds.every((round) => round.panoId.startsWith('pano-'))).toBe(true)
    expect(decryptGameState(session.token).rounds.every((round) => round.latitude > 0)).toBe(true)
  })

  it('widens the search radius on every attempt', async () => {
    const [place] = await getQuestPlaces(questId)
    const finder = new FakePanoramaFinder('empty')

    expect((await findLiveLocation(place, finder)).panorama).toBeNull()
    expect(finder.calls.map((call) => call.radius)).toEqual(SEARCH_RADII_METERS)
  })

  it('uses the cache only as a last resort, when Street View is failing', async () => {
    await fillCache()

    const { game } = await startGame(userId, questId, { finder: new FakePanoramaFinder('error') })

    expect(game.rounds).toHaveLength(5)
    expect(game.rounds.every((round) => round.panoId.startsWith('cached-'))).toBe(true)
    expect(new Set(game.rounds.map((round) => round.panoId)).size).toBe(5)
  })

  it('keeps the cache of each place bounded but rotating', async () => {
    const [place] = await getQuestPlaces(questId)

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
    await expect(startGame(userId, questId, { finder: new FakePanoramaFinder('empty') })).rejects.toThrow(
      'No pudimos encontrar imágenes'
    )
  })

  it('rejects unknown or disabled quests', async () => {
    await expect(startGame(userId, 999, { finder: new FakePanoramaFinder() })).rejects.toThrow('no encontrado')
    await DB.table('quests').where('id', questId).update({ enabled: false })
    await expect(startGame(userId, questId, { finder: new FakePanoramaFinder() })).rejects.toThrow('no encontrado')
  })
})
