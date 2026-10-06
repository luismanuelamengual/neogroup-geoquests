import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClassicMultiplayerGameData } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameData'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { classicMultiplayerMode } from '@/app/(protected)/(game)/services/classicMultiplayerMode'
import { cleanupGames } from '@/app/(protected)/(game)/services/gameCleanup'
import {
  createGame,
  getActiveGame,
  getGame,
  getGames,
  joinGame,
  kickPlayer,
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
const ROUND_MS = 180_000
const REVEAL_MS = 15_000
const ATLANTIC = { latitude: 0, longitude: -30 }

/** Options of a request made `ms` after START. */
function at(ms: number): GameOptions {
  return { now: () => new Date(START.getTime() + ms), finder: new FakePanoramaFinder() }
}

function mp(game: GameView): ClassicMultiplayerGameView {
  return game.modeView as ClassicMultiplayerGameView
}

async function view(userId: number, gameId: number, ms: number): Promise<GameView> {
  const response = await getGame(userId, { gameId }, at(ms))

  if (response.unchanged) {
    throw new Error('unexpected unchanged response')
  }

  return response.game
}

describe('classic multiplayer flow', () => {
  let host: number
  let ana: number
  let beto: number
  let mapId: number
  const originalSettings = classicMultiplayerMode.definition.settings

  beforeEach(async () => {
    await resetDatabase()
    host = await createUser('host@geoquests.test')
    ana = await createUser('ana@geoquests.test')
    beto = await createUser('beto@geoquests.test')
    mapId = (await getMaps())[0].id
  })

  afterEach(() => {
    classicMultiplayerMode.definition.settings = originalSettings
  })

  function createLobby(ms = 0): Promise<GameView> {
    return createGame(host, { mapId, mode: GameMode.CLASSIC_MULTIPLAYER }, at(ms))
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

  async function answersOf(gameId: number): Promise<GameRound[]> {
    return ((await Game.find(gameId))!.data as ClassicMultiplayerGameData).rounds
  }

  /** A game with the host and Ana, started at 0 (the first round begins at COUNTDOWN_MS). */
  async function startedGame(): Promise<GameView> {
    const lobby = await createLobby()

    await joinGame(ana, { code: lobby.code! }, at(0))

    return startGame(host, { gameId: lobby.id }, at(0))
  }

  it('creates a game waiting for players, with an invitation code', async () => {
    const lobby = await createLobby()

    expect(lobby).toMatchObject({ mode: GameMode.CLASSIC_MULTIPLAYER, status: GameStatus.LOBBY, hostUserId: host })
    expect(lobby.code).toMatch(/^[A-Z2-9]{6}$/)
    expect(lobby.players.map((player) => player.userId)).toEqual([host])
    expect(mp(lobby)).toMatchObject({ currentRoundNumber: null, rounds: [], minPlayers: 2, maxPlayers: 8 })
    // Rounds are not chosen until the game starts.
    expect(await answersOf(lobby.id)).toEqual([])
  })

  it('lets players join with the code (as typed) and shows them to everybody', async () => {
    const lobby = await createLobby()
    const typed = `${lobby.code!.slice(0, 3).toLowerCase()}-${lobby.code!.slice(3)}`
    const joined = await joinGame(ana, { code: typed }, at(1000))

    expect(joined.players.map((player) => player.userId)).toEqual([host, ana])
    // The host's poll sees the change.
    expect((await getGame(host, { gameId: lobby.id, sinceVersion: lobby.version }, at(2000))).unchanged).toBe(false)
    // Joining again just returns the game.
    expect((await joinGame(ana, { code: lobby.code! }, at(3000))).players).toHaveLength(2)
    await expect(joinGame(beto, { code: 'ZZZZZZ' }, at(0))).rejects.toThrow('No encontramos una partida')
  })

  it('allows only one multiplayer game at a time per player', async () => {
    const lobby = await createLobby()

    await expect(createLobby()).rejects.toThrow('Ya estás en otra partida')

    const other = await createGame(beto, { mapId, mode: GameMode.CLASSIC_MULTIPLAYER }, at(0))

    await joinGame(ana, { code: lobby.code! }, at(0))
    await expect(joinGame(ana, { code: other.code! }, at(0))).rejects.toThrow('Ya estás en otra partida')
    expect((await getActiveGame(ana, at(0)))?.id).toBe(lobby.id)
  })

  it('does not accept more players than the settings allow', async () => {
    classicMultiplayerMode.definition.settings = { ...classicMultiplayerMode.definition.settings, maxPlayers: 2 }

    const lobby = await createLobby()

    await joinGame(ana, { code: lobby.code! }, at(0))
    await expect(joinGame(beto, { code: lobby.code! }, at(0))).rejects.toThrow('completa')
  })

  it('is started by the host once there are enough players', async () => {
    const lobby = await createLobby()

    await expect(startGame(host, { gameId: lobby.id }, at(0))).rejects.toThrow('al menos 2 jugadores')
    await joinGame(ana, { code: lobby.code! }, at(0))
    await expect(startGame(ana, { gameId: lobby.id }, at(0))).rejects.toThrow('Solo el anfitrión')

    const started = await startGame(host, { gameId: lobby.id }, at(0))

    expect(started.status).toBe(GameStatus.IN_PROGRESS)
    expect(mp(started)).toMatchObject({
      phase: 'guessing',
      currentRoundNumber: 1,
      countdownMs: COUNTDOWN_MS,
      roundTimeLeftMs: ROUND_MS,
      hasGuessed: false
    })
    // Only the current round is sent, without its answer.
    expect(mp(started).rounds).toHaveLength(1)
    expect(mp(started).rounds[0]).toMatchObject({ closed: false, location: null, placeName: null, guesses: [] })
    expect(await answersOf(lobby.id)).toHaveLength(5)
    await expect(joinGame(beto, { code: lobby.code! }, at(0))).rejects.toThrow('ya empezó')
    await expect(startGame(host, { gameId: lobby.id }, at(0))).rejects.toThrow('ya empezó')
  })

  it('plays everybody the same round, with the same clock, hiding the pins until it closes', async () => {
    const game = await startedGame()
    const [answer] = await answersOf(game.id)

    await expect(guess(host, game.id, 1, answer, 1000)).rejects.toThrow('todavía no empezó')

    const afterHost = mp(await guess(host, game.id, 1, answer, 5000))

    expect(afterHost).toMatchObject({ phase: 'guessing', hasGuessed: true, guessedUserIds: [host] })
    await expect(guess(host, game.id, 1, ATLANTIC, 6000)).rejects.toThrow('Ya respondiste')

    // Ana sees that the host guessed, but not where, and has the same panorama.
    const anaView = mp(await view(ana, game.id, 7000))

    expect(anaView).toMatchObject({ hasGuessed: false, guessedUserIds: [host] })
    expect(anaView.rounds[0]).toMatchObject({ panoId: mp(game).rounds[0].panoId, location: null, guesses: [] })

    // The last guess closes the round for everybody.
    // Ana guesses the antipode of the answer (the answers are random), so she is as far as possible.
    const antipode = {
      latitude: -answer.latitude,
      longitude: answer.longitude > 0 ? answer.longitude - 180 : answer.longitude + 180
    }
    const closed = mp(await guess(ana, game.id, 1, antipode, 8000))

    expect(closed.phase).toBe('reveal')
    expect(closed.revealTimeLeftMs).toBe(REVEAL_MS)
    expect(closed.rounds[0]).toMatchObject({
      closed: true,
      location: { latitude: answer.latitude, longitude: answer.longitude }
    })
    // Ana's guess is on the other side of the world: far from the answer, so (almost) no points.
    const [hostGuess, anaGuess] = closed.rounds[0].guesses

    expect([hostGuess.userId, hostGuess.score]).toEqual([host, 5000])
    expect(anaGuess.userId).toBe(ana)
    expect(anaGuess.score).toBeLessThan(100)
    expect(closed.standings.map((standing) => [standing.userId, standing.position])).toEqual([
      [host, 1],
      [ana, 2]
    ])
  })

  it('closes the round when the time runs out, scoring 0 to whoever did not guess', async () => {
    const game = await startedGame()
    const late = COUNTDOWN_MS + ROUND_MS + ROUND_TIME_GRACE_MS + 1

    // Everybody keeps polling (connected) but nobody guesses.
    for (let ms = 0; ms < late; ms += 10_000) {
      await getGame(host, { gameId: game.id }, at(ms))
      await getGame(ana, { gameId: game.id }, at(ms))
    }

    expect(mp(await view(host, game.id, late - 2))).toMatchObject({ phase: 'guessing', roundTimeLeftMs: 0 })

    const closed = mp(await view(host, game.id, late))

    expect(closed.phase).toBe('reveal')
    expect(closed.rounds[0].guesses.every((playerGuess) => playerGuess.timedOut && playerGuess.score === 0)).toBe(true)
  })

  it('does not wait for players who stopped playing (disconnected)', async () => {
    const game = await startedGame()
    const [answer] = await answersOf(game.id)

    // Ana was seen at 0; 10 s later she is still connected: the round waits for her.
    expect(mp(await guess(host, game.id, 1, answer, 10_000)).phase).toBe('guessing')

    // At 40 s she has been gone for more than 20 s: the next request closes the round.
    const closed = mp(await view(host, game.id, 40_000))

    expect(closed.phase).toBe('reveal')
    expect(closed.rounds[0].guesses.find((playerGuess) => playerGuess.userId === ana)?.timedOut).toBe(true)
  })

  it('starts the next round after the result is shown, or when the host says so', async () => {
    const game = await startedGame()

    await guess(host, game.id, 1, ATLANTIC, 5000)
    await guess(ana, game.id, 1, ATLANTIC, 6000)

    // Only the host can skip the wait.
    await expect(sendGameAction(ana, { gameId: game.id, action: { type: 'next' } }, at(7000))).rejects.toThrow(
      'Solo el anfitrión'
    )

    const skipped = mp(await sendGameAction(host, { gameId: game.id, action: { type: 'next' } }, at(7000)))

    expect(skipped).toMatchObject({ phase: 'guessing', currentRoundNumber: 2, countdownMs: COUNTDOWN_MS })

    await guess(host, game.id, 2, ATLANTIC, 12_000)
    await guess(ana, game.id, 2, ATLANTIC, 13_000)
    expect(mp(await view(ana, game.id, 13_000 + REVEAL_MS - 1)).phase).toBe('reveal')
    // Once the result was shown long enough, the next request starts round 3.
    expect(mp(await view(ana, game.id, 13_000 + REVEAL_MS))).toMatchObject({ phase: 'guessing', currentRoundNumber: 3 })
  })

  it('finishes after the last round and stores the results of every player', async () => {
    const game = await startedGame()
    const answers = await answersOf(game.id)
    let ms = 0

    for (let round = 1; round <= 5; round++) {
      ms += 5000
      // Ana keeps polling the game (as the clients do): she is connected.
      await getGame(ana, { gameId: game.id }, at(ms))
      await guess(host, game.id, round, ATLANTIC, ms)
      await guess(ana, game.id, round, answers[round - 1], ms)
      ms += REVEAL_MS
      await getGame(host, { gameId: game.id }, at(ms))
    }

    const finished = await view(host, game.id, ms)

    expect(finished).toMatchObject({ status: GameStatus.FINISHED, code: null })
    expect(finished.players.find((player) => player.userId === ana)).toMatchObject({
      score: 25000,
      position: 1,
      outcome: GameOutcome.WON
    })
    expect(finished.players.find((player) => player.userId === host)).toMatchObject({
      position: 2,
      outcome: GameOutcome.LOST
    })
    expect((await getGames(ana)).items[0]).toMatchObject({
      mode: GameMode.CLASSIC_MULTIPLAYER,
      status: GameStatus.FINISHED,
      playersCount: 2,
      score: 25000,
      position: 1,
      completedSteps: 5,
      totalSteps: 5
    })
    expect(await getActiveGame(ana, at(ms))).toBeNull()
    await expect(guess(host, game.id, 5, ATLANTIC, ms)).rejects.toThrow('La partida ya terminó')
  })

  it('records guesses sent at the same time without losing any', async () => {
    const game = await startedGame()

    await Promise.all([guess(host, game.id, 1, ATLANTIC, 5000), guess(ana, game.id, 1, ATLANTIC, 5000)])

    const closed = mp(await view(host, game.id, 5000))

    expect(closed.phase).toBe('reveal')
    expect(closed.rounds[0].guesses.filter((playerGuess) => !playerGuess.timedOut)).toHaveLength(2)
  })

  describe('leaving', () => {
    it('removes players who leave before the game starts, passing the host role on', async () => {
      const lobby = await createLobby()

      await joinGame(ana, { code: lobby.code! }, at(0))
      await joinGame(beto, { code: lobby.code! }, at(0))
      await leaveGame(host, { gameId: lobby.id }, at(1000))

      const after = await view(ana, lobby.id, 1000)

      expect(after.hostUserId).toBe(ana)
      expect(after.players.map((player) => player.userId)).toEqual([ana, beto])
      await expect(getGame(host, { gameId: lobby.id }, at(1000))).rejects.toThrow('Partida no encontrada')
    })

    it('deletes a game nobody is waiting in anymore', async () => {
      const lobby = await createLobby()

      await leaveGame(host, { gameId: lobby.id }, at(0))
      expect(await Game.count()).toBe(0)
    })

    it('keeps in the results a player who leaves a game being played, without waiting for them', async () => {
      const game = await startedGame()

      await leaveGame(ana, { gameId: game.id }, at(4000))
      expect((await GamePlayer.where('userId', ana).first())?.status).toBe(GamePlayerStatus.LEFT)

      // The host is alone now: its guess closes the round.
      expect(mp(await guess(host, game.id, 1, ATLANTIC, 5000)).phase).toBe('reveal')
    })

    it('finishes a game being played when everybody left', async () => {
      const game = await startedGame()

      await leaveGame(ana, { gameId: game.id }, at(4000))
      await leaveGame(host, { gameId: game.id }, at(5000))

      expect((await Game.find(game.id))?.status).toBe(GameStatus.FINISHED)
    })
  })

  it('lets the host remove players only before the game starts', async () => {
    const lobby = await createLobby()

    await joinGame(ana, { code: lobby.code! }, at(0))
    await joinGame(beto, { code: lobby.code! }, at(0))
    await expect(kickPlayer(ana, { gameId: lobby.id, userId: beto }, at(0))).rejects.toThrow('Solo el anfitrión')

    const after = await kickPlayer(host, { gameId: lobby.id, userId: beto }, at(0))

    expect(after.players.map((player) => player.userId)).toEqual([host, ana])

    await startGame(host, { gameId: lobby.id }, at(0))
    await expect(kickPlayer(host, { gameId: lobby.id, userId: ana }, at(0))).rejects.toThrow('antes de empezar')
  })

  it('finishes games everybody abandoned, keeping the results so far', async () => {
    const game = await startedGame()

    await guess(host, game.id, 1, ATLANTIC, 5000)

    const later = new Date(START.getTime() + 60 * 60 * 1000)

    expect(await cleanupGames({ now: later, random: Math.random, finder: new FakePanoramaFinder() })).toBe(1)
    expect((await Game.find(game.id))?.status).toBe(GameStatus.FINISHED)
    expect(await GamePlayer.where('gameId', game.id).count()).toBe(2)
  })
})
