import { beforeEach, describe, expect, it } from 'vitest'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import { getGame, getRecentGames, startGame, submitGuess } from '@/app/(protected)/(game)/services/games'
import { getPlaces } from '@/app/(protected)/(game)/services/places'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakeImageryProvider } from '@/tests/setup/fakeProvider'

describe('game flow', () => {
  let userId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
  })

  it('seeds the 20 cities of "Ciudades del mundo"', async () => {
    const places = await getPlaces(GameMode.WORLD_CITIES)

    expect(places).toHaveLength(20)
    expect(places.filter((place) => place.polygon)).toHaveLength(3)
    expect(places.find((place) => place.name === 'París')?.polygon?.type).toBe('Polygon')
  })

  it('starts a game with 5 rounds in 5 different places, hiding the answers', async () => {
    const provider = new FakeImageryProvider()
    const game = await startGame(userId, GameMode.WORLD_CITIES, { provider })

    expect(game.status).toBe(GameStatus.IN_PROGRESS)
    expect(game.rounds).toHaveLength(5)
    expect(game.currentRoundNumber).toBe(1)
    expect(new Set(game.rounds.map((round) => round.imageId)).size).toBe(5)

    for (const round of game.rounds) {
      expect(round.location).toBeNull()
      expect(round.placeName).toBeNull()
    }

    // Every found image is cached for later games.
    expect(await PlaceLocation.count()).toBe(5)
  })

  it('plays the 5 rounds and finishes with the sum of the scores', async () => {
    const provider = new FakeImageryProvider()
    let game = await startGame(userId, GameMode.WORLD_CITIES, { provider })
    const answers = provider.calls

    for (let roundNumber = 1; roundNumber <= 5; roundNumber++) {
      // Guess 1: exactly on the spot; the rest, somewhere in the Atlantic.
      const guess = roundNumber === 1 ? answers[0] : { latitude: 0, longitude: -30 }
      const expectedAnswer = await PlaceLocation.where('imageId', game.rounds[roundNumber - 1].imageId).first()

      game = await submitGuess(userId, { gameId: game.id, roundNumber, ...guess })

      const round = game.rounds[roundNumber - 1]

      expect(round.guessed).toBe(true)
      expect(round.location).toEqual({ latitude: expectedAnswer!.latitude, longitude: expectedAnswer!.longitude })
      expect(round.placeName).toBeTruthy()
    }

    expect(game.status).toBe(GameStatus.FINISHED)
    expect(game.currentRoundNumber).toBeNull()
    expect(game.totalScore).toBe(game.rounds.reduce((total, round) => total + (round.score ?? 0), 0))
    expect(game.rounds[0].score).toBeGreaterThan(0)
    expect(game.maxScore).toBe(25000)

    const recent = await getRecentGames(userId)

    expect(recent[0]).toMatchObject({ id: game.id, status: GameStatus.FINISHED, playedRounds: 5 })
  })

  it('rejects guesses for rounds already played and games of other users', async () => {
    const game = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })
    const otherUserId = await createUser('other@geoquests.test')

    await submitGuess(userId, { gameId: game.id, roundNumber: 1, latitude: 0, longitude: 0 })
    await expect(submitGuess(userId, { gameId: game.id, roundNumber: 1, latitude: 0, longitude: 0 })).rejects.toThrow(
      'Esa ronda ya fue jugada'
    )
    await expect(getGame(otherUserId, game.id)).rejects.toThrow('Partida no encontrada')
  })

  it('falls back to cached locations when the provider fails', async () => {
    await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })
    await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider() })

    // Cached locations exist for (at most) 10 places: with the provider down a
    // game can still be built from them.
    const cachedPlaces = new Set((await PlaceLocation.get()).map((location) => location.placeId))

    if (cachedPlaces.size >= 5) {
      const game = await startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider('error') })

      expect(game.rounds).toHaveLength(5)
    }
  })

  it('fails with a clear message when no imagery is available at all', async () => {
    await expect(
      startGame(userId, GameMode.WORLD_CITIES, { provider: new FakeImageryProvider('empty') })
    ).rejects.toThrow('No pudimos encontrar imágenes')
  })
})
