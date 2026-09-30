import { beforeEach, describe, expect, it } from 'vitest'
import { BattleRoyaleGameData } from '@/app/(protected)/(game)/models/BattleRoyaleGameData'
import { BattleRoyaleGameView } from '@/app/(protected)/(game)/models/BattleRoyaleGameView'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { SPARE_ROUNDS } from '@/app/(protected)/(game)/services/battleRoyaleMode'
import {
  createGame,
  getGame,
  getGames,
  joinGame,
  leaveGame,
  sendGameAction,
  startGame
} from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { ROUND_TIME_GRACE_MS } from '@/app/(protected)/(game)/utils/guesses'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const START = new Date('2026-01-01T10:00:00Z')
const COUNTDOWN_MS = 3000
const ROUND_MS = 60_000
const REVEAL_MS = 15_000

function at(ms: number): GameOptions {
  return { now: () => new Date(START.getTime() + ms), finder: new FakePanoramaFinder() }
}

function br(game: GameView): BattleRoyaleGameView {
  return game.modeView as BattleRoyaleGameView
}

/** A position `km` kilometers north of a location. */
function north(location: LatLng, km: number): LatLng {
  return { latitude: location.latitude + km / 111.2, longitude: location.longitude }
}

describe('battle royale flow', () => {
  let host: number
  let ana: number
  let beto: number
  let mapId: number

  beforeEach(async () => {
    await resetDatabase()
    host = await createUser('host@geoquests.test')
    ana = await createUser('ana@geoquests.test')
    beto = await createUser('beto@geoquests.test')
    mapId = (await getMaps())[0].id
  })

  async function view(userId: number, gameId: number, ms: number): Promise<GameView> {
    const response = await getGame(userId, { gameId }, at(ms))

    if (response.unchanged) {
      throw new Error('unexpected unchanged response')
    }

    return response.game
  }

  function guess(userId: number, gameId: number, roundNumber: number, position: LatLng | null, ms: number) {
    return sendGameAction(
      userId,
      {
        gameId,
        action: {
          type: 'guess',
          roundNumber,
          latitude: position?.latitude ?? null,
          longitude: position?.longitude ?? null
        }
      },
      at(ms)
    )
  }

  async function roundsOf(gameId: number): Promise<GameRound[]> {
    return ((await Game.find(gameId))!.data as BattleRoyaleGameData).rounds
  }

  /** A game with the host, Ana and Beto, started at 0 (the first round begins at COUNTDOWN_MS). */
  async function startedGame(): Promise<GameView> {
    const lobby = await createGame(host, { mapId, mode: GameMode.BATTLE_ROYALE }, at(0))

    await joinGame(ana, { code: lobby.code! }, at(0))
    await joinGame(beto, { code: lobby.code! }, at(0))

    return startGame(host, { gameId: lobby.id }, at(0))
  }

  it('needs at least 3 players and plans one round per elimination (plus spares)', async () => {
    const lobby = await createGame(host, { mapId, mode: GameMode.BATTLE_ROYALE }, at(0))

    await joinGame(ana, { code: lobby.code! }, at(0))
    await expect(startGame(host, { gameId: lobby.id }, at(0))).rejects.toThrow('al menos 3 jugadores')
    await joinGame(beto, { code: lobby.code! }, at(0))

    const started = await startGame(host, { gameId: lobby.id }, at(0))

    expect(started.status).toBe(GameStatus.IN_PROGRESS)
    expect(br(started)).toMatchObject({
      currentRoundNumber: 1,
      aliveUserIds: [host, ana, beto],
      isEliminated: false,
      countdownMs: COUNTDOWN_MS
    })
    expect(await roundsOf(lobby.id)).toHaveLength(2 + SPARE_ROUNDS)
  })

  it('eliminates the farthest player every round until one is left, who wins', async () => {
    const game = await startedGame()
    const rounds = await roundsOf(game.id)

    // Round 1: Beto is the farthest.
    await guess(host, game.id, 1, north(rounds[0], 1), 5000)
    await guess(ana, game.id, 1, north(rounds[0], 5), 5000)

    const first = br(await guess(beto, game.id, 1, north(rounds[0], 50), 6000))

    expect(first).toMatchObject({ phase: 'reveal', eliminatedThisRound: [beto], aliveUserIds: [host, ana] })
    expect(first.rounds[0].guesses.map((playerGuess) => playerGuess.userId)).toEqual([host, ana, beto])

    // Beto keeps watching, but can't guess anymore.
    const next = await sendGameAction(host, { gameId: game.id, action: { type: 'next' } }, at(7000))

    expect(br(next)).toMatchObject({ phase: 'guessing', currentRoundNumber: 2 })
    expect(br(await view(beto, game.id, 7000)).isEliminated).toBe(true)
    await expect(guess(beto, game.id, 2, rounds[1], 11_000)).rejects.toThrow('Quedaste eliminado')

    // Round 2: the host is the farthest. Once two guessed (Beto is out), the round closes.
    await guess(ana, game.id, 2, north(rounds[1], 2), 11_000)

    const second = br(await guess(host, game.id, 2, north(rounds[1], 20), 12_000))

    expect(second).toMatchObject({ phase: 'reveal', eliminatedThisRound: [host], aliveUserIds: [ana] })
    // The only guesses shown are those of the players who played the round.
    expect(second.rounds[1].guesses.map((playerGuess) => playerGuess.userId)).toEqual([ana, host])

    const finished = await view(ana, game.id, 12_000 + REVEAL_MS)

    expect(finished.status).toBe(GameStatus.FINISHED)
    expect(br(finished).standings).toEqual([
      expect.objectContaining({ userId: ana, position: 1, eliminatedInRound: null }),
      expect.objectContaining({ userId: host, position: 2, eliminatedInRound: 2 }),
      expect.objectContaining({ userId: beto, position: 3, eliminatedInRound: 1 })
    ])
    expect(finished.players.find((player) => player.userId === ana)).toMatchObject({
      position: 1,
      outcome: GameOutcome.WON
    })
    expect(finished.players.find((player) => player.userId === beto)).toMatchObject({
      position: 3,
      outcome: GameOutcome.LOST
    })
    expect((await getGames(host)).items[0]).toMatchObject({
      mode: GameMode.BATTLE_ROYALE,
      position: 2,
      maxScore: null,
      playersCount: 3
    })
  })

  it('on a tie at the farthest distance, eliminates the one who guessed last', async () => {
    const game = await startedGame()
    const [round] = await roundsOf(game.id)

    await guess(host, game.id, 1, north(round, 1), 5000)
    await guess(ana, game.id, 1, north(round, 30), 6000)

    const closed = br(await guess(beto, game.id, 1, north(round, 30), 7000))

    expect(closed.eliminatedThisRound).toEqual([beto])
  })

  it('eliminates whoever did not guess in time', async () => {
    const game = await startedGame()
    const [round] = await roundsOf(game.id)
    const late = COUNTDOWN_MS + ROUND_MS + ROUND_TIME_GRACE_MS + 1

    // Everybody keeps polling (connected); only the host guesses.
    for (let ms = 0; ms < late; ms += 10_000) {
      await getGame(ana, { gameId: game.id }, at(ms))
      await getGame(beto, { gameId: game.id }, at(ms))
    }

    await guess(host, game.id, 1, north(round, 500), 5000)

    const closed = br(await view(host, game.id, late))

    expect(closed.phase).toBe('reveal')
    expect(closed.eliminatedThisRound.sort()).toEqual([ana, beto].sort())

    // A single player is left: the game ends after the result.
    expect((await view(host, game.id, late + REVEAL_MS)).status).toBe(GameStatus.FINISHED)
  })

  it('eliminates nobody when nobody guessed', async () => {
    const game = await startedGame()
    const late = COUNTDOWN_MS + ROUND_MS + ROUND_TIME_GRACE_MS + 1

    for (let ms = 0; ms < late; ms += 10_000) {
      await getGame(host, { gameId: game.id }, at(ms))
      await getGame(ana, { gameId: game.id }, at(ms))
      await getGame(beto, { gameId: game.id }, at(ms))
    }

    const closed = br(await view(host, game.id, late))

    expect(closed).toMatchObject({ phase: 'reveal', eliminatedThisRound: [] })
    expect(closed.aliveUserIds).toHaveLength(3)
  })

  it('eliminates a player who leaves the game', async () => {
    const game = await startedGame()
    const [round] = await roundsOf(game.id)

    await leaveGame(beto, { gameId: game.id }, at(4000))
    await guess(host, game.id, 1, north(round, 10), 5000)

    // Beto is not waited for: Ana's guess closes the round, and Beto falls (not Ana, the farthest).
    const closed = br(await guess(ana, game.id, 1, north(round, 20), 6000))

    expect(closed.phase).toBe('reveal')
    expect(closed.eliminatedThisRound).toEqual([beto])
    expect(closed.aliveUserIds).toEqual([host, ana])
  })
})
