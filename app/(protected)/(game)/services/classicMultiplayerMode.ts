import { ClassicMultiplayerGameData } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameData'
import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameMembers } from '@/app/(protected)/(game)/models/GameMembers'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeDefinition } from '@/app/(protected)/(game)/models/GameModeDefinition'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GuessAction } from '@/app/(protected)/(game)/models/GuessAction'
import { MultiplayerRoundView } from '@/app/(protected)/(game)/models/MultiplayerRoundView'
import { RoundTiming } from '@/app/(protected)/(game)/models/RoundTiming'
import {
  getRoundTiming,
  isPlayerConnected,
  rankPlayers,
  toPlayerGuessView
} from '@/app/(protected)/(game)/services/roundBasedMode'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import {
  evaluateGuess,
  getRoundTimeLeftMs,
  isRoundTimeOver,
  parseGuessPosition,
  timedOutGuess
} from '@/app/(protected)/(game)/utils/guesses'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

const definition: GameModeDefinition<ClassicMultiplayerGameSettings> = {
  mode: GameMode.CLASSIC_MULTIPLAYER,
  slug: 'multiplayer',
  name: 'Con amigos',
  description: 'De 2 a 8 jugadores, las mismas calles al mismo tiempo. Gana el que más se acerque.',
  image: '/modes/multiplayer.png',
  minPlayers: 2,
  maxPlayers: 8,
  realtime: true,
  defaultSettings: {
    rounds: 5,
    timeLimitSeconds: 120,
    maxPlayers: 8,
    revealSeconds: 15,
    countdownSeconds: 3,
    scoreScaleKm: 15
  },
  // Nobody asked for the game in 5 minutes (every round writes while someone plays): finished as it is.
  abandonAfterMs: 5 * 60 * 1000,
  abandonAction: 'finish'
}

/** An integer setting within [min, max], or the fallback when missing or invalid. */
function intSetting(value: unknown, min: number, max: number, fallback: number): number {
  const number = Math.round(Number(value ?? fallback))

  return Number.isFinite(number) ? Math.min(Math.max(number, min), max) : fallback
}

function getTiming(data: ClassicMultiplayerGameData): RoundTiming {
  return getRoundTiming(data.roundStartedAt, data.settings.timeLimitSeconds)!
}

function guessOf(data: ClassicMultiplayerGameData, userId: number, roundNumber: number): GameGuess | null {
  return data.guesses[String(userId)]?.[roundNumber - 1] ?? null
}

/** Players still playing: in the game since it started (they have guesses) and not gone. */
function getPlayingPlayers(data: ClassicMultiplayerGameData, { players }: GameMembers): GamePlayer[] {
  return players.filter((player) => player.status === GamePlayerStatus.ACTIVE && String(player.userId) in data.guesses)
}

/** Starts a round: the same clock for everybody, after the countdown. */
function beginRound(data: ClassicMultiplayerGameData, roundNumber: number, now: Date): void {
  data.currentRound = roundNumber
  data.phase = 'guessing'
  data.roundStartedAt = new Date(now.getTime() + data.settings.countdownSeconds * 1000).toISOString()
  data.revealedAt = null
}

/**
 * Closes the current round when every connected player guessed (the acting
 * player counts as connected) or its time ran out: whoever did not guess
 * scores 0, and the result is shown to everybody.
 */
function closeRoundIfDone(
  data: ClassicMultiplayerGameData,
  members: GameMembers,
  now: Date,
  actingUserId: number | null = null
): boolean {
  if (data.phase !== 'guessing' || data.currentRound === 0 || data.finished) {
    return false
  }

  const connected = getPlayingPlayers(data, members).filter(
    (player) => player.userId === actingUserId || isPlayerConnected(player, now)
  )
  const everybodyGuessed =
    connected.length > 0 && connected.every((player) => guessOf(data, player.userId, data.currentRound) !== null)

  if (!everybodyGuessed && !isRoundTimeOver(getTiming(data), now)) {
    return false
  }

  const index = data.currentRound - 1

  for (const playerGuesses of Object.values(data.guesses)) {
    playerGuesses[index] = playerGuesses[index] ?? timedOutGuess()
  }

  data.phase = 'reveal'
  data.revealedAt = now.toISOString()

  return true
}

/** After the result of a round: the next round, or the end of the game after the last one. */
function goToNextRound(data: ClassicMultiplayerGameData, now: Date): boolean {
  if (data.currentRound >= data.rounds.length) {
    data.finished = true
  } else {
    beginRound(data, data.currentRound + 1, now)
  }

  return true
}

function isRevealOver(data: ClassicMultiplayerGameData, now: Date): boolean {
  return (
    data.phase === 'reveal' &&
    !!data.revealedAt &&
    now.getTime() >= new Date(data.revealedAt).getTime() + data.settings.revealSeconds * 1000
  )
}

function guess(
  data: ClassicMultiplayerGameData,
  userId: number,
  action: GuessAction,
  members: GameMembers,
  now: Date
): boolean {
  if (!getPlayingPlayers(data, members).some((player) => player.userId === userId)) {
    throw new ApiException('No estás jugando esta partida', 403)
  }

  if (data.phase !== 'guessing' || Number(action.roundNumber) !== data.currentRound) {
    throw new ApiException('Esa ronda ya terminó')
  }

  const timing = getTiming(data)

  if (now < timing.startedAt) {
    throw new ApiException('La ronda todavía no empezó')
  }

  if (guessOf(data, userId, data.currentRound)) {
    throw new ApiException('Ya respondiste esta ronda')
  }

  const position = parseGuessPosition(action.latitude, action.longitude)
  const index = data.currentRound - 1

  data.guesses[String(userId)][index] = evaluateGuess(
    data.rounds[index],
    position,
    timing,
    now,
    data.settings.scoreScaleKm ?? definition.defaultSettings.scoreScaleKm
  )
  closeRoundIfDone(data, members, now, userId)

  return true
}

function toRoundView(data: ClassicMultiplayerGameData, index: number): MultiplayerRoundView {
  const round = data.rounds[index]
  const closed = index < data.currentRound - 1 || data.phase === 'reveal' || data.finished

  return {
    roundNumber: index + 1,
    panoId: round.panoId,
    closed,
    placeName: closed ? round.placeName : null,
    countryCode: closed ? round.countryCode : null,
    location: closed ? { latitude: round.latitude, longitude: round.longitude } : null,
    guesses: closed
      ? Object.entries(data.guesses)
          .map(([userId, playerGuesses]) => toPlayerGuessView(Number(userId), playerGuesses[index] ?? null))
          .sort((a, b) => b.score - a.score || (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
      : []
  }
}

/**
 * Classic multiplayer mode: 2 to 8 friends play the same rounds at the same
 * time, with the same clock. A round closes when everybody guessed or the
 * time runs out; then everybody's pins are shown for a few seconds (the host
 * can skip the wait) and the next round starts after a short countdown. The
 * highest total score wins (ties: the lowest total distance).
 */
export const classicMultiplayerMode: GameModeEngine<
  ClassicMultiplayerGameData,
  ClassicMultiplayerGameSettings,
  ClassicMultiplayerGameView
> = {
  definition,

  resolveSettings(questSettings) {
    const defaults = definition.defaultSettings

    return {
      rounds: intSetting(questSettings.rounds, 1, 20, defaults.rounds),
      timeLimitSeconds: intSetting(questSettings.timeLimitSeconds, 10, 600, defaults.timeLimitSeconds),
      maxPlayers: intSetting(
        questSettings.maxPlayers,
        definition.minPlayers,
        definition.maxPlayers,
        defaults.maxPlayers
      ),
      revealSeconds: intSetting(questSettings.revealSeconds, 3, 60, defaults.revealSeconds),
      countdownSeconds: intSetting(questSettings.countdownSeconds, 0, 10, defaults.countdownSeconds),
      scoreScaleKm: intSetting(questSettings.scoreScaleKm, 1, 2000, defaults.scoreScaleKm)
    }
  },

  async create(questId, settings) {
    if (questId == null) {
      throw new ApiException('Modo de juego no encontrado', 404)
    }

    // The rounds are chosen when the host starts the game.
    return {
      v: 1,
      settings,
      questId,
      phase: 'guessing',
      currentRound: 0,
      roundStartedAt: null,
      revealedAt: null,
      finished: false,
      rounds: [],
      guesses: {}
    }
  },

  getMaxPlayers(data) {
    return data.settings.maxPlayers
  },

  async start(data, { players }, ctx: GameContext) {
    data.rounds = await planGameRounds(data.questId, data.settings.rounds, ctx)
    data.guesses = Object.fromEntries(
      players
        .filter((player) => player.status === GamePlayerStatus.ACTIVE)
        .map((player) => [String(player.userId), data.rounds.map(() => null)])
    )
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
        return guess(data, userId, action, members, ctx.now)
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

  finalize(data, { players }) {
    const standings = rankPlayers(
      players.map((player) => player.userId),
      data.guesses
    )
    const winners = standings.filter((standing) => standing.position === 1).length

    return standings.map((standing) => ({
      userId: standing.userId,
      score: standing.score,
      position: standing.position,
      outcome: standing.position !== 1 ? GameOutcome.LOST : winners > 1 ? GameOutcome.DRAW : GameOutcome.WON
    }))
  },

  toView(data, userId, { players }, ctx) {
    const now = ctx.now
    const started = data.currentRound > 0
    const guessing = started && !data.finished && data.phase === 'guessing'
    const timing = started ? getTiming(data) : null
    const revealEndsAt =
      data.phase === 'reveal' && data.revealedAt
        ? new Date(data.revealedAt).getTime() + data.settings.revealSeconds * 1000
        : null

    return {
      phase: data.phase,
      roundsCount: data.settings.rounds,
      maxScore: MAX_ROUND_SCORE * data.settings.rounds,
      minPlayers: definition.minPlayers,
      maxPlayers: data.settings.maxPlayers,
      timeLimitSeconds: data.settings.timeLimitSeconds,
      currentRoundNumber: started ? data.currentRound : null,
      countdownMs: guessing && timing ? Math.max(0, timing.startedAt.getTime() - now.getTime()) : 0,
      roundTimeLeftMs:
        guessing && timing ? Math.min(data.settings.timeLimitSeconds * 1000, getRoundTimeLeftMs(timing, now)) : null,
      revealTimeLeftMs: !data.finished && revealEndsAt != null ? Math.max(0, revealEndsAt - now.getTime()) : null,
      hasGuessed: guessing && guessOf(data, userId, data.currentRound) !== null,
      guessedUserIds: guessing
        ? Object.keys(data.guesses)
            .map(Number)
            .filter((playerId) => guessOf(data, playerId, data.currentRound) !== null)
        : [],
      rounds: data.rounds.slice(0, data.currentRound).map((_, index) => toRoundView(data, index)),
      standings: rankPlayers(
        players.map((player) => player.userId),
        data.guesses
      )
    }
  },

  summarize(data, userId) {
    const closedRounds = data.finished
      ? data.rounds.length
      : Math.max(0, data.phase === 'reveal' ? data.currentRound : data.currentRound - 1)

    return {
      score: (data.guesses[String(userId)] ?? []).reduce((total, guess) => total + (guess?.score ?? 0), 0),
      maxScore: MAX_ROUND_SCORE * data.settings.rounds,
      completedSteps: closedRounds,
      totalSteps: data.settings.rounds
    }
  }
}
