import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import {
  deleteAbandonedGames,
  getGame,
  getGameResult,
  getRecentGames,
  startGame,
  submitGuess
} from '@/app/(protected)/(game)/services/games'
import { decryptGameState } from '@/app/(protected)/(game)/services/gameTokens'
import { findRandomLocation, MAX_CACHED_LOCATIONS_PER_PLACE } from '@/app/(protected)/(game)/services/locations'
import { getPlaces } from '@/app/(protected)/(game)/services/places'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakeImageryProvider } from '@/tests/setup/fakeProvider'

const ATLANTIC = { latitude: 0, longitude: -30 }

describe('game flow', () => {
  let userId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
  })

  it('seeds the 20 cities of "Ciudades del mundo"', async () => {
    const places = await getPlaces(GameMode.WORLD_CITIES)

    expect(places).toHaveLength(20)
    expect(places.filter((place) => place.geometry.type === 'Polygon')).toHaveLength(3)
    expect(places.filter((place) => place.geometry.type === 'Point')).toHaveLength(17)
    expect(places.find((place) => place.name === 'Mendoza')?.geometry).toEqual({
      type: 'Point',
      coordinates: [-68.8458, -32.8895],
      radius: 5000
    })
  })

  it('starts a game with 5 rounds in 5 different places, hiding the answers', async () => {
    const provider = new FakeImageryProvider()
    const { game, token } = await startGame(userId, GameMode.WORLD_CITIES, { provider })

    expect(game.status).toBe(GameStatus.IN_PROGRESS)
    expect(game.rounds).toHaveLength(5)
    expect(game.currentRoundNumber).toBe(1)
    expect(new Set(game.rounds.map((round) => round.imageId)).size).toBe(5)

    for (const round of game.rounds) {
      expect(round.location).toBeNull()
      expect(round.placeName).toBeNull()
    }

    // The answers only travel inside the encrypted token, never in clear.
    expect(token).not.toContain(game.rounds[0].imageId)
    expect(decryptGameState(token).rounds[0].imageId).toBe(game.rounds[0].imageId)
    // Only the game row is stored (plus the location cache).
    expect(await Game.count()).toBe(1)
    expect(await PlaceLocation.count()).toBe(5)
  })

  it('plays the 5 rounds and finishes with the sum of the scores', async () => {
    const provider = new FakeImageryProvider()
    let session = await startGame(userId, GameMode.WORLD_CITIES, { provider })
    const answers = decryptGameState(session.token).rounds

    for (let roundNumber = 1; roundNumber <= 5; roundNumber++) {
      // Guess 1: exactly on the spot; the rest, in the middle of the Atlantic.
      const guess = roundNumber === 1 ? answers[0] : ATLANTIC

      session = await submitGuess(userId, { token: session.token, roundNumber, ...guess })

      const round = session.game.rounds[roundNumber - 1]

      expect(round.guessed).toBe(true)
      expect(round.location).toEqual({
        latitude: answers[roundNumber - 1].latitude,
        longitude: answers[roundNumber - 1].longitude
      })
      expect(round.placeName).toBe(answers[roundNumber - 1].placeName)
    }

    const { game } = session

    expect(game.status).toBe(GameStatus.FINISHED)
    expect(game.currentRoundNumber).toBeNull()
    expect(game.rounds[0].score).toBe(5000)
    expect(game.totalScore).toBe(game.rounds.reduce((total, round) => total + (round.score ?? 0), 0))
    expect(game.maxScore).toBe(25000)

    const result = await getGameResult(userId, game.id)

    expect(result).toMatchObject({ status: GameStatus.FINISHED, playedRounds: 5, totalScore: game.totalScore })
    expect((await getRecentGames(userId))[0].id).toBe(game.id)
  })

  it('rejects replaying an old token to guess a round again', async () => {
    const start = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })
    const answer = decryptGameState(start.token).rounds[0]

    await submitGuess(userId, { token: start.token, roundNumber: 1, ...ATLANTIC })

    // Same (valid) token again, now knowing the answer.
    await expect(submitGuess(userId, { token: start.token, roundNumber: 1, ...answer })).rejects.toThrow(
      'desactualizada'
    )
    await expect(getGame(userId, start.token)).rejects.toThrow('desactualizada')
  })

  it('rejects tampered tokens and tokens of other users', async () => {
    const { token } = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })
    const otherUserId = await createUser('other@geoquests.test')
    const tampered = token.slice(0, -4) + (token.endsWith('AAAA') ? 'BBBB' : 'AAAA')

    await expect(getGame(userId, tampered)).rejects.toThrow('La partida no es válida')
    await expect(getGame(userId, 'not-a-token')).rejects.toThrow('La partida no es válida')
    await expect(getGame(otherUserId, token)).rejects.toThrow('Partida no encontrada')
    await expect(submitGuess(userId, { token, roundNumber: 2, ...ATLANTIC })).rejects.toThrow('Esa ronda ya fue jugada')
  })

  it('deletes games abandoned for more than a day', async () => {
    const { game } = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })

    await DB.table('games')
      .where('id', game.id)
      .update({ createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) })
    expect(await deleteAbandonedGames()).toBe(1)
    expect(await Game.count()).toBe(0)
  })

  it('falls back to cached locations when the provider fails', async () => {
    await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })
    await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })

    const cachedPlaces = new Set((await PlaceLocation.get()).map((location) => location.placeId))

    if (cachedPlaces.size >= 5) {
      const { game } = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider('error') })

      expect(game.rounds).toHaveLength(5)
    }
  })

  it('caps the location cache of each place', async () => {
    const [place] = await getPlaces(GameMode.WORLD_CITIES)

    await DB.table('place_locations').insert(
      Array.from({ length: MAX_CACHED_LOCATIONS_PER_PLACE }, (_, index) => ({
        placeId: place.id,
        imageId: `old-${index}`,
        latitude: 0,
        longitude: 0,
        isPano: true
      }))
    )
    await findRandomLocation(place, new FakeImageryProvider())

    expect(await PlaceLocation.where('placeId', place.id).count()).toBe(MAX_CACHED_LOCATIONS_PER_PLACE)
  })

  it('fails with a clear message when no imagery is available at all', async () => {
    await expect(
      startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider('empty') })
    ).rejects.toThrow('No pudimos encontrar imágenes')
  })
})
