import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { ClassicGameSettings } from '@/app/(protected)/(game)/models/ClassicGameSettings'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameMembers } from '@/app/(protected)/(game)/models/GameMembers'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeDefinition } from '@/app/(protected)/(game)/models/GameModeDefinition'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { GameSummary } from '@/app/(protected)/(game)/models/GameSummary'
import { GuessAction } from '@/app/(protected)/(game)/models/GuessAction'
import { RoundTiming } from '@/app/(protected)/(game)/models/RoundTiming'
import { RoundView } from '@/app/(protected)/(game)/models/RoundView'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import { evaluateGuess, getRoundTimeLeftMs, parseGuessPosition } from '@/app/(protected)/(game)/utils/guesses'
import {
  DEFAULT_SCORE_MAX_DISTANCE_KM,
  MAX_ROUND_SCORE,
  MAX_SCORE_MAX_DISTANCE_KM,
  MIN_SCORE_MAX_DISTANCE_KM
} from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/** Most rounds a quest can configure for a classic game. */
const MAX_ROUNDS = 20
/** Largest score scale a quest can configure (the whole world fits in it). */
const definition: GameModeDefinition<ClassicGameSettings> = {
  mode: GameMode.CLASSIC,
  slug: 'classic',
  name: 'Clásico',
  description: 'Jugá solo, a tu ritmo: aparecés en una calle del mundo y tenés que adivinar dónde estás.',
  image: '/modes/classic.png',
  minPlayers: 1,
  maxPlayers: 1,
  realtime: false,
  defaultSettings: { rounds: 5, timeLimitSeconds: null, scoreMaxDistanceKm: DEFAULT_SCORE_MAX_DISTANCE_KM },
  // Left unfinished for a day: deleted (as before the game modes existed).
  abandonAfterMs: 24 * 60 * 60 * 1000,
  abandonAction: 'delete'
}

function isFinished(data: ClassicGameData): boolean {
  return data.currentRound > data.rounds.length
}

/** Clock of the current round (null: no time limit, or the round was not started yet). */
function getTiming(data: ClassicGameData): RoundTiming | null {
  if (data.settings.timeLimitSeconds == null || !data.roundStartedAt) {
    return null
  }

  return { startedAt: new Date(data.roundStartedAt), timeLimitSeconds: data.settings.timeLimitSeconds }
}

function getTotalScore(data: ClassicGameData): number {
  return data.guesses.reduce((total, guess) => total + (guess?.score ?? 0), 0)
}

/** Client view of a round: the answer (position, place) only once it was played. */
function toRoundView(round: GameRound, guess: GameGuess | null, index: number): RoundView {
  const played = guess !== null

  return {
    roundNumber: index + 1,
    panoId: round.panoId,
    guessed: played,
    placeName: played ? round.placeName : null,
    countryCode: played ? round.countryCode : null,
    location: played ? { latitude: round.latitude, longitude: round.longitude } : null,
    guess:
      played && guess.latitude != null && guess.longitude != null
        ? { latitude: guess.latitude, longitude: guess.longitude }
        : null,
    distanceMeters: played ? guess.distanceMeters : null,
    score: played ? guess.score : null,
    timedOut: played && guess.timedOut
  }
}

/**
 * Starts the clock of the current round (timed games): the client calls it
 * when it shows the round. Idempotent — once started, the round keeps its
 * original start time, so reloading the page never gives extra time.
 */
function startRound(data: ClassicGameData, ctx: GameContext): boolean {
  if (data.settings.timeLimitSeconds == null || data.roundStartedAt) {
    return false
  }

  data.roundStartedAt = ctx.now.toISOString()

  return true
}

/**
 * Registers the guess of the current round: distance to the real location and
 * score. Timed games: the round must have been started, and a guess arriving
 * after the time limit (plus the grace period) — or no guess at all, when the
 * countdown ended before a pin was placed — scores 0.
 */
function guess(data: ClassicGameData, action: GuessAction, ctx: GameContext): boolean {
  const position = parseGuessPosition(action.latitude, action.longitude)

  if (Number(action.roundNumber) !== data.currentRound) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  const timed = data.settings.timeLimitSeconds != null

  if (timed && !data.roundStartedAt) {
    throw new ApiException('La ronda todavía no empezó')
  }

  if (!timed && !position) {
    throw new ApiException('Marcá un lugar en el mapa')
  }

  const index = data.currentRound - 1

  data.guesses[index] = evaluateGuess(
    data.rounds[index],
    position,
    getTiming(data),
    ctx.now,
    data.settings.scoreMaxDistanceKm ?? definition.defaultSettings.scoreMaxDistanceKm
  )
  data.currentRound++
  data.roundStartedAt = null

  return true
}

/**
 * Classic mode: a single player guesses where a series of Street View
 * panoramas are, one round after the other, optionally with a time limit per
 * round measured by the server.
 */
export const classicMode: GameModeEngine<ClassicGameData, ClassicGameSettings, ClassicGameView> = {
  definition,

  resolveSettings(questSettings) {
    const rounds = Math.round(Number(questSettings.rounds ?? definition.defaultSettings.rounds))
    const time = Math.round(Number(questSettings.timeLimitSeconds ?? definition.defaultSettings.timeLimitSeconds))
    const maxDistance = Number(questSettings.scoreMaxDistanceKm ?? definition.defaultSettings.scoreMaxDistanceKm)

    return {
      rounds: Number.isFinite(rounds) ? Math.min(Math.max(rounds, 1), MAX_ROUNDS) : definition.defaultSettings.rounds,
      timeLimitSeconds: Number.isFinite(time) && time > 0 ? time : null,
      scoreMaxDistanceKm:
        Number.isFinite(maxDistance) && maxDistance > 0
          ? Math.min(Math.max(maxDistance, MIN_SCORE_MAX_DISTANCE_KM), MAX_SCORE_MAX_DISTANCE_KM)
          : definition.defaultSettings.scoreMaxDistanceKm
    }
  },

  async create(questId, settings, ctx) {
    if (questId == null) {
      throw new ApiException('Modo de juego no encontrado', 404)
    }

    const rounds = await planGameRounds(questId, settings.rounds, ctx)

    return { v: 1, settings, currentRound: 1, roundStartedAt: null, rounds, guesses: rounds.map(() => null) }
  },

  getMaxPlayers() {
    return 1
  },

  async start() {
    // Nothing to do: the clock of each round starts when the client shows it (startRound).
  },

  advance() {
    return false
  },

  handleAction(data, _userId, action: GameAction, _members, ctx) {
    if (isFinished(data)) {
      throw new ApiException('La partida ya terminó')
    }

    switch (action?.type) {
      case 'startRound':
        return startRound(data, ctx)
      case 'guess':
        return guess(data, action, ctx)
      default:
        throw new ApiException('Acción no válida')
    }
  },

  isFinished,

  finalize(data, { players }: GameMembers): GamePlayerResult[] {
    return players.map((player) => ({ userId: player.userId, score: getTotalScore(data), position: 1, outcome: null }))
  },

  toView(data, _userId, _members, ctx): ClassicGameView {
    const finished = isFinished(data)
    const timing = getTiming(data)

    return {
      roundsCount: data.rounds.length,
      totalScore: getTotalScore(data),
      maxScore: MAX_ROUND_SCORE * data.rounds.length,
      currentRoundNumber: finished ? null : data.currentRound,
      timeLimitSeconds: data.settings.timeLimitSeconds,
      roundTimeLeftMs: !finished && timing ? getRoundTimeLeftMs(timing, ctx.now) : null,
      rounds: data.rounds.map((round, index) => toRoundView(round, data.guesses[index] ?? null, index))
    }
  },

  summarize(data): GameSummary {
    return {
      score: getTotalScore(data),
      maxScore: MAX_ROUND_SCORE * data.rounds.length,
      completedSteps: data.guesses.filter((guess) => guess !== null).length,
      totalSteps: data.rounds.length
    }
  }
}
