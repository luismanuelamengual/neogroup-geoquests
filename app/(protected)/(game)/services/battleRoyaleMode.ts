import { BattleRoyaleGameData } from '@/app/(protected)/(game)/models/BattleRoyaleGameData'
import { BattleRoyaleGameSettings } from '@/app/(protected)/(game)/models/BattleRoyaleGameSettings'
import { BattleRoyaleGameView } from '@/app/(protected)/(game)/models/BattleRoyaleGameView'
import { BattleRoyaleStandingView } from '@/app/(protected)/(game)/models/BattleRoyaleStandingView'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameMembers } from '@/app/(protected)/(game)/models/GameMembers'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeDefinition } from '@/app/(protected)/(game)/models/GameModeDefinition'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import {
  beginRound,
  closeRound,
  createLobbyData,
  guessOf,
  initGuesses,
  isRevealOver,
  isRoundDone,
  rankPlayers,
  recordGuess,
  toMultiplayerGameView
} from '@/app/(protected)/(game)/services/roundBasedMode'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import { DEFAULT_SCORE_MAX_DISTANCE_KM } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/**
 * Rounds chosen beyond the minimum (players − 1): a round where nobody
 * guessed eliminates nobody, so a few spare locations keep the game going.
 */
export const SPARE_ROUNDS = 2

const definition: GameModeDefinition<BattleRoyaleGameSettings> = {
  mode: GameMode.BATTLE_ROYALE,
  slug: 'battle-royale',
  name: 'Battle Royale',
  description: 'De 3 a 8 jugadores: en cada ronda queda eliminado el que marcó más lejos. El último en pie gana.',
  image: '/modes/battle-royale.png',
  minPlayers: 3,
  maxPlayers: 8,
  realtime: true,
  settings: {
    timeLimitSeconds: 180,
    maxPlayers: 8,
    revealSeconds: 15,
    countdownSeconds: 3,
    scoreMaxDistanceKm: DEFAULT_SCORE_MAX_DISTANCE_KM
  },
  // Nobody asked for the game in 5 minutes (every round writes while someone plays): finished as it is.
  abandonAfterMs: 5 * 60 * 1000,
  abandonAction: 'finish'
}

function getEliminatedIds(data: BattleRoyaleGameData): Set<number> {
  return new Set(data.eliminations.map((elimination) => elimination.userId))
}

/** Players still in the game (not eliminated), whether they are connected or not. */
function getAliveUserIds(data: BattleRoyaleGameData): number[] {
  const eliminated = getEliminatedIds(data)

  return Object.keys(data.guesses)
    .map(Number)
    .filter((userId) => !eliminated.has(userId))
}

/** Players who play the current round: alive and still in the game. */
function getPlayingPlayers(data: BattleRoyaleGameData, { players }: GameMembers): GamePlayer[] {
  const alive = new Set(getAliveUserIds(data))

  return players.filter((player) => player.status === GamePlayerStatus.ACTIVE && alive.has(player.userId))
}

/**
 * Who falls when a round closes (among the `alive` players):
 *
 *   - if nobody guessed, nobody (a spare round is played);
 *   - otherwise, whoever did not guess; if everybody guessed, the farthest
 *     one — on a tie, the one who guessed last;
 *   - players who left the game fall too.
 *
 * It never eliminates everybody still playing (e.g. an exact tie between the
 * last two): then only those who left fall.
 */
function getFallen(data: BattleRoyaleGameData, alive: number[], { players }: GameMembers): number[] {
  const roundNumber = data.currentRound
  const left = alive.filter(
    (userId) => players.find((player) => player.userId === userId)?.status !== GamePlayerStatus.ACTIVE
  )
  const guesses = alive.map((userId) => ({ userId, guess: guessOf(data, userId, roundNumber)! }))
  const guessers = guesses.filter(({ guess }) => !guess.timedOut)
  let fallen: number[] = []

  if (guessers.length > 0) {
    const missing = guesses.filter(({ guess }) => guess.timedOut)

    if (missing.length > 0) {
      fallen = missing.map(({ userId }) => userId)
    } else {
      const farthest = Math.max(...guessers.map(({ guess }) => guess.distanceMeters ?? 0))
      const tied = guessers.filter(({ guess }) => (guess.distanceMeters ?? 0) === farthest)
      const lastTime = Math.max(...tied.map(({ guess }) => new Date(guess.guessedAt ?? 0).getTime()))

      fallen = tied
        .filter(({ guess }) => new Date(guess.guessedAt ?? 0).getTime() === lastTime)
        .map(({ userId }) => userId)
    }
  }

  fallen = [...new Set([...fallen, ...left])]

  const stillPlaying = alive.filter((userId) => !left.includes(userId))

  if (stillPlaying.length > 0 && stillPlaying.every((userId) => fallen.includes(userId))) {
    return left
  }

  return fallen
}

/** Closes the current round when it is done: whoever did not guess scores 0, and the fallen are eliminated. */
function closeRoundIfDone(
  data: BattleRoyaleGameData,
  members: GameMembers,
  now: Date,
  actingUserId: number | null = null
): boolean {
  if (!isRoundDone(data, getPlayingPlayers(data, members), now, actingUserId)) {
    return false
  }

  const alive = getAliveUserIds(data)

  closeRound(data, alive, now)

  for (const userId of getFallen(data, alive, members)) {
    data.eliminations.push({ userId, roundNumber: data.currentRound })
  }

  return true
}

/** After the result of a round: the end of the game once a single player is left (or no spare rounds remain). */
function goToNextRound(data: BattleRoyaleGameData, now: Date): boolean {
  if (getAliveUserIds(data).length <= 1 || data.currentRound >= data.rounds.length) {
    data.finished = true
  } else {
    beginRound(data, data.currentRound + 1, now)
  }

  return true
}

/**
 * Positions: the players still in the game first (by points if more than one
 * is left), then the eliminated ones — the later they fell, the better —
 * sharing the position with whoever fell in the same round.
 */
function getStandings(data: BattleRoyaleGameData): BattleRoyaleStandingView[] {
  const eliminatedIn = new Map(data.eliminations.map((elimination) => [elimination.userId, elimination.roundNumber]))
  const scores = rankPlayers(Object.keys(data.guesses).map(Number), data.guesses)
  const scoreOf = (userId: number) => scores.find((standing) => standing.userId === userId)?.score ?? 0
  const alive = rankPlayers(getAliveUserIds(data), data.guesses)
  const standings: BattleRoyaleStandingView[] = alive.map((standing) => ({
    userId: standing.userId,
    position: standing.position,
    score: standing.score,
    eliminatedInRound: null
  }))
  const rounds = [...new Set(data.eliminations.map((elimination) => elimination.roundNumber))].sort((a, b) => b - a)
  let position = alive.length + 1

  for (const round of rounds) {
    const fallen = [...eliminatedIn.entries()].filter(([, roundNumber]) => roundNumber === round).map(([id]) => id)

    for (const userId of fallen) {
      standings.push({ userId, position, score: scoreOf(userId), eliminatedInRound: round })
    }

    position += fallen.length
  }

  return standings
}

/**
 * Battle royale mode: 3 to 8 friends play the same rounds at the same time,
 * with the same clock (like the classic multiplayer mode). Every round, the
 * player whose pin landed farthest is eliminated — and keeps watching the
 * game —, until a single player is left: the winner.
 */
export const battleRoyaleMode: GameModeEngine<BattleRoyaleGameData, BattleRoyaleGameSettings, BattleRoyaleGameView> = {
  definition,

  async create(mapId, settings) {
    if (mapId == null) {
      throw new ApiException('Mapa no encontrado', 404)
    }

    // The rounds are chosen when the host starts the game (their number depends on the players).
    return { ...createLobbyData(mapId, settings), eliminations: [] }
  },

  getMaxPlayers(data) {
    return data.settings.maxPlayers
  },

  async start(data, { players }, ctx: GameContext) {
    const playersCount = players.filter((player) => player.status === GamePlayerStatus.ACTIVE).length

    data.rounds = await planGameRounds(data.mapId, playersCount - 1 + SPARE_ROUNDS, ctx)
    data.eliminations = []
    initGuesses(data, players)
    beginRound(data, 1, ctx.now)
  },

  advance(data, members, ctx) {
    let changed = false

    // At most two steps: a round closes, and its result ends (the next round then starts now).
    for (let step = 0; step < 2 && data.currentRound > 0 && !data.finished; step++) {
      if (closeRoundIfDone(data, members, ctx.now)) {
        changed = true
      } else if (isRevealOver(data, ctx.now)) {
        changed = goToNextRound(data, ctx.now) || changed
      } else {
        break
      }
    }

    return changed
  },

  handleAction(data, userId, action: GameAction, members, ctx) {
    if (data.currentRound === 0) {
      throw new ApiException('La partida todavía no empezó')
    }

    if (data.finished) {
      throw new ApiException('La partida ya terminó')
    }

    switch (action?.type) {
      case 'guess':
        if (getEliminatedIds(data).has(userId)) {
          throw new ApiException('Quedaste eliminado: ya no podés responder')
        }

        recordGuess(data, userId, action, getPlayingPlayers(data, members), ctx.now)
        closeRoundIfDone(data, members, ctx.now, userId)

        return true
      case 'next':
        if (userId !== members.hostUserId) {
          throw new ApiException('Solo el anfitrión puede pasar a la siguiente ronda', 403)
        }

        if (data.phase !== 'reveal') {
          throw new ApiException('La ronda todavía no terminó')
        }

        return goToNextRound(data, ctx.now)
      default:
        throw new ApiException('Acción no válida')
    }
  },

  isFinished(data) {
    return data.finished
  },

  finalize(data) {
    const standings = getStandings(data)
    const winners = standings.filter((standing) => standing.position === 1).length

    return standings.map((standing) => ({
      userId: standing.userId,
      score: standing.score,
      position: standing.position,
      outcome: standing.position !== 1 ? GameOutcome.LOST : winners > 1 ? GameOutcome.DRAW : GameOutcome.WON
    }))
  },

  toView(data, userId, _members, ctx) {
    const eliminated = getEliminatedIds(data)

    return {
      ...toMultiplayerGameView(
        data,
        userId,
        { minPlayers: definition.minPlayers, maxPlayers: data.settings.maxPlayers },
        ctx.now
      ),
      aliveUserIds: getAliveUserIds(data),
      isEliminated: eliminated.has(userId),
      eliminatedThisRound:
        data.phase === 'reveal'
          ? data.eliminations
              .filter((elimination) => elimination.roundNumber === data.currentRound)
              .map((elimination) => elimination.userId)
          : [],
      standings: getStandings(data)
    }
  },

  summarize(data, userId) {
    const closedRounds = data.finished
      ? data.currentRound
      : Math.max(0, data.phase === 'reveal' ? data.currentRound : data.currentRound - 1)

    return {
      score: (data.guesses[String(userId)] ?? []).reduce((total, guess) => total + (guess?.score ?? 0), 0),
      maxScore: null,
      completedSteps: closedRounds,
      // Rounds needed to have a winner: one elimination per round.
      totalSteps: Math.max(1, Object.keys(data.guesses).length - 1)
    }
  }
}
