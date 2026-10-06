import { BattleRoyaleBlockScoreView } from '@/app/(protected)/(game)/models/BattleRoyaleBlockScoreView'
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
  getScoredGuesses,
  guessOf,
  initGuesses,
  isRevealOver,
  isRoundDone,
  MISSING_GUESS_DISTANCE_METERS,
  rankPlayers,
  recordGuess,
  toMultiplayerGameView
} from '@/app/(protected)/(game)/services/roundBasedMode'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import { DEFAULT_SCORE_MAX_DISTANCE_KM } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/**
 * Rounds chosen beyond the minimum (one block of rounds per elimination): a
 * block where nobody guessed eliminates nobody, so a few spare locations keep
 * the game going.
 */
export const SPARE_ROUNDS = 2

const definition: GameModeDefinition<BattleRoyaleGameSettings> = {
  mode: GameMode.BATTLE_ROYALE,
  slug: 'battle-royale',
  name: 'Battle Royale',
  description:
    'De 3 a 8 jugadores: cada tanda de rondas queda eliminado el que menos puntos sumó. El último en pie gana.',
  image: '/modes/battle-royale.png',
  minPlayers: 3,
  maxPlayers: 8,
  realtime: true,
  settings: {
    timeLimitSeconds: 180,
    maxPlayers: 8,
    revealSeconds: 15,
    countdownSeconds: 3,
    scoreMaxDistanceKm: DEFAULT_SCORE_MAX_DISTANCE_KM,
    roundsPerElimination: 1
  },
  configurable: { timeLimitSeconds: [30, 60, 120, 180, 300], roundsPerElimination: [1, 2, 3] },
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

/** Rounds played between one elimination and the next (games created before this rule: 1). */
function getRoundsPerElimination(data: BattleRoyaleGameData): number {
  return Math.max(1, data.settings.roundsPerElimination ?? 1)
}

/**
 * First round of the block the current round belongs to: the one after the
 * last elimination decided by points (the points start again from 0 there).
 */
function getBlockStartRound(data: BattleRoyaleGameData): number {
  const resets = data.eliminations
    .filter((elimination) => elimination.scoresReset && elimination.roundNumber < data.currentRound)
    .map((elimination) => elimination.roundNumber)

  return Math.max(0, ...resets) + 1
}

/** Number of the current round within its block (1-based). */
function getRoundInBlock(data: BattleRoyaleGameData): number {
  return data.currentRound - getBlockStartRound(data) + 1
}

/** Whether the current round is the one that ends with an elimination (the block is complete). */
function isEliminationRound(data: BattleRoyaleGameData): boolean {
  return getRoundInBlock(data) >= getRoundsPerElimination(data)
}

/** What a player did in the rounds of the current block (up to the current one). */
function getBlockResult(data: BattleRoyaleGameData, userId: number) {
  const guesses = (data.guesses[String(userId)] ?? []).slice(getBlockStartRound(data) - 1, data.currentRound)
  const answered = guesses.filter((guess) => guess && !guess.timedOut)

  return {
    userId,
    answered: answered.length,
    score: guesses.reduce((total, guess) => total + (guess?.score ?? 0), 0),
    distanceMeters: guesses.reduce(
      (total, guess) => total + (guess ? (guess.distanceMeters ?? MISSING_GUESS_DISTANCE_METERS) : 0),
      0
    ),
    lastGuessedAt: Math.max(0, ...answered.map((guess) => new Date(guess!.guessedAt ?? 0).getTime()))
  }
}

/**
 * Who falls because of the points when a block of several rounds is complete
 * (among the players still playing):
 *
 *   - if nobody guessed in the whole block, nobody (the block goes on);
 *   - otherwise, whoever did not guess in any round; if everybody did, the one
 *     with the fewest points — on a tie, the one who added up more distance,
 *     and then the one who guessed last.
 */
function getFallenByBlock(data: BattleRoyaleGameData, stillPlaying: number[]): number[] {
  const results = stillPlaying.map((userId) => getBlockResult(data, userId))

  if (results.every((result) => result.answered === 0)) {
    return []
  }

  const missing = results.filter((result) => result.answered === 0)

  if (missing.length > 0) {
    return missing.map((result) => result.userId)
  }

  const [worst] = [...results].sort(
    (a, b) => a.score - b.score || b.distanceMeters - a.distanceMeters || b.lastGuessedAt - a.lastGuessedAt
  )

  return [worst.userId]
}

/** Who falls because of the single round that just closed (1 round per elimination): see getFallen. */
function getFallenByRound(data: BattleRoyaleGameData, alive: number[]): number[] {
  const roundNumber = data.currentRound
  const guesses = alive.map((userId) => ({ userId, guess: guessOf(data, userId, roundNumber)! }))
  const guessers = guesses.filter(({ guess }) => !guess.timedOut)

  if (guessers.length === 0) {
    return []
  }

  const missing = guesses.filter(({ guess }) => guess.timedOut)

  if (missing.length > 0) {
    return missing.map(({ userId }) => userId)
  }

  const farthest = Math.max(...guessers.map(({ guess }) => guess.distanceMeters ?? 0))
  const tied = guessers.filter(({ guess }) => (guess.distanceMeters ?? 0) === farthest)
  const lastTime = Math.max(...tied.map(({ guess }) => new Date(guess.guessedAt ?? 0).getTime()))

  return tied.filter(({ guess }) => new Date(guess.guessedAt ?? 0).getTime() === lastTime).map(({ userId }) => userId)
}

/**
 * Who falls when a round closes (among the `alive` players):
 *
 *   - when the round ends a block (`roundsPerElimination` rounds since the last
 *     elimination), whoever is last by points: with 1 round, the one who did not
 *     guess or, if everybody guessed, the farthest (on a tie, the one who guessed
 *     last); with more, see getFallenByBlock. If nobody guessed, nobody falls and
 *     the block goes on;
 *   - players who left the game fall too, in any round.
 *
 * It never eliminates everybody still playing (e.g. an exact tie between the
 * last two): then only those who left fall.
 *
 * `reset` tells whether somebody fell because of the points (the points start again from 0).
 */
function getFallen(
  data: BattleRoyaleGameData,
  alive: number[],
  { players }: GameMembers
): { fallen: number[]; reset: boolean } {
  const left = alive.filter(
    (userId) => players.find((player) => player.userId === userId)?.status !== GamePlayerStatus.ACTIVE
  )
  const stillPlaying = alive.filter((userId) => !left.includes(userId))
  let byPoints: number[] = []

  if (isEliminationRound(data)) {
    byPoints = getRoundsPerElimination(data) > 1 ? getFallenByBlock(data, stillPlaying) : getFallenByRound(data, alive)
  }

  byPoints = byPoints.filter((userId) => !left.includes(userId))

  if (stillPlaying.length > 0 && stillPlaying.every((userId) => byPoints.includes(userId))) {
    byPoints = []
  }

  return { fallen: [...new Set([...byPoints, ...left])], reset: byPoints.length > 0 }
}

function isLeft(userId: number, { players }: GameMembers): boolean {
  return players.find((player) => player.userId === userId)?.status !== GamePlayerStatus.ACTIVE
}

/** Closes the current round when it is done: whoever did not guess scores 0, and the fallen (if the block is complete) are eliminated. */
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

  const { fallen, reset } = getFallen(data, alive, members)

  for (const userId of fallen) {
    data.eliminations.push({ userId, roundNumber: data.currentRound, scoresReset: reset && !isLeft(userId, members) })
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

/** Points added up in the current block by the players who played its last round, best first. */
function getBlockScores(data: BattleRoyaleGameData): BattleRoyaleBlockScoreView[] {
  if (data.currentRound === 0) {
    return []
  }

  const fellNow = data.phase === 'reveal' ? data.eliminations.filter((e) => e.roundNumber === data.currentRound) : []
  const players = new Set([...getAliveUserIds(data), ...fellNow.map((elimination) => elimination.userId)])
  const hidden = data.phase === 'guessing' && !data.finished ? 1 : 0
  const from = getBlockStartRound(data) - 1

  return [...players]
    .map((userId) => ({
      userId,
      score: (data.guesses[String(userId)] ?? [])
        .slice(from, data.currentRound - hidden)
        .reduce((total, guess) => total + (guess?.score ?? 0), 0)
    }))
    .sort((a, b) => b.score - a.score)
}

/**
 * Positions: the players still in the game first (by points if more than one
 * is left), then the eliminated ones — the later they fell, the better —
 * sharing the position with whoever fell in the same round.
 */
function getStandings(data: BattleRoyaleGameData): BattleRoyaleStandingView[] {
  const eliminatedIn = new Map(data.eliminations.map((elimination) => [elimination.userId, elimination.roundNumber]))
  const guesses = getScoredGuesses(data)
  const scores = rankPlayers(Object.keys(data.guesses).map(Number), guesses)
  const scoreOf = (userId: number) => scores.find((standing) => standing.userId === userId)?.score ?? 0
  const alive = rankPlayers(getAliveUserIds(data), guesses)
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
 * with the same clock (like the classic multiplayer mode). Every
 * `roundsPerElimination` rounds (1 by default) the player with the fewest points
 * in them — the one whose pin landed farthest, with a single round — is
 * eliminated (and keeps watching the game) and the points start again from 0,
 * until a single player is left: the winner.
 */
export const battleRoyaleMode: GameModeEngine<BattleRoyaleGameData, BattleRoyaleGameSettings, BattleRoyaleGameView> = {
  definition,

  async create(mapId, settings) {
    if (mapId == null) {
      throw new ApiException('errors.mapNotFound', 404)
    }

    // The rounds are chosen when the host starts the game (their number depends on the players).
    return { ...createLobbyData(mapId, settings), eliminations: [] }
  },

  getMaxPlayers(data) {
    return data.settings.maxPlayers
  },

  async start(data, { players }, ctx: GameContext) {
    const playersCount = players.filter((player) => player.status === GamePlayerStatus.ACTIVE).length

    data.rounds = await planGameRounds(
      data.mapId,
      (playersCount - 1) * getRoundsPerElimination(data) + SPARE_ROUNDS,
      ctx
    )
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
      throw new ApiException('errors.gameNotStarted')
    }

    if (data.finished) {
      throw new ApiException('errors.gameAlreadyOver')
    }

    switch (action?.type) {
      case 'guess':
        if (getEliminatedIds(data).has(userId)) {
          throw new ApiException('errors.eliminatedCannotAnswer')
        }

        recordGuess(data, userId, action, getPlayingPlayers(data, members), ctx.now)
        closeRoundIfDone(data, members, ctx.now, userId)

        return true
      case 'next':
        if (userId !== members.hostUserId) {
          throw new ApiException('errors.onlyHostCanAdvance', 403)
        }

        if (data.phase !== 'reveal') {
          throw new ApiException('errors.roundNotFinished')
        }

        return goToNextRound(data, ctx.now)
      default:
        throw new ApiException('errors.invalidAction')
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
      roundsPerElimination: getRoundsPerElimination(data),
      roundInBlock: data.currentRound > 0 ? getRoundInBlock(data) : 1,
      eliminationRound: data.currentRound > 0 && isEliminationRound(data),
      blockScores: getBlockScores(data),
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
      score: (getScoredGuesses(data)[String(userId)] ?? []).reduce((total, guess) => total + (guess?.score ?? 0), 0),
      maxScore: null,
      completedSteps: closedRounds,
      // Rounds needed to have a winner: one elimination per block of rounds.
      totalSteps: Math.max(1, (Object.keys(data.guesses).length - 1) * getRoundsPerElimination(data))
    }
  }
}
