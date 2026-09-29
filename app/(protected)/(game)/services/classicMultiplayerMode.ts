import { ClassicMultiplayerGameData } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameData'
import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
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
  floatSetting,
  initGuesses,
  intSetting,
  isRevealOver,
  isRoundDone,
  rankPlayers,
  recordGuess,
  toMultiplayerGameView
} from '@/app/(protected)/(game)/services/roundBasedMode'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import {
  DEFAULT_SCORE_MAX_DISTANCE_KM,
  MAX_ROUND_SCORE,
  MAX_SCORE_MAX_DISTANCE_KM,
  MIN_SCORE_MAX_DISTANCE_KM
} from '@/app/(protected)/(game)/utils/score'
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
    scoreMaxDistanceKm: DEFAULT_SCORE_MAX_DISTANCE_KM
  },
  // Nobody asked for the game in 5 minutes (every round writes while someone plays): finished as it is.
  abandonAfterMs: 5 * 60 * 1000,
  abandonAction: 'finish'
}

/** Players still playing: in the game since it started (they have guesses) and not gone. */
function getPlayingPlayers(data: ClassicMultiplayerGameData, { players }: GameMembers): GamePlayer[] {
  return players.filter((player) => player.status === GamePlayerStatus.ACTIVE && String(player.userId) in data.guesses)
}

/** Closes the current round when it is done: whoever did not guess scores 0. */
function closeRoundIfDone(
  data: ClassicMultiplayerGameData,
  members: GameMembers,
  now: Date,
  actingUserId: number | null = null
): boolean {
  if (!isRoundDone(data, getPlayingPlayers(data, members), now, actingUserId)) {
    return false
  }

  closeRound(data, Object.keys(data.guesses).map(Number), now)

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
      scoreMaxDistanceKm: floatSetting(
        questSettings.scoreMaxDistanceKm,
        MIN_SCORE_MAX_DISTANCE_KM,
        MAX_SCORE_MAX_DISTANCE_KM,
        defaults.scoreMaxDistanceKm
      )
    }
  },

  async create(questId, settings) {
    if (questId == null) {
      throw new ApiException('Modo de juego no encontrado', 404)
    }

    // The rounds are chosen when the host starts the game.
    return createLobbyData(questId, settings)
  },

  getMaxPlayers(data) {
    return data.settings.maxPlayers
  },

  async start(data, { players }, ctx: GameContext) {
    data.rounds = await planGameRounds(data.questId, data.settings.rounds, ctx)
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
    return {
      ...toMultiplayerGameView(
        data,
        userId,
        { minPlayers: definition.minPlayers, maxPlayers: data.settings.maxPlayers },
        ctx.now
      ),
      roundsCount: data.settings.rounds,
      maxScore: MAX_ROUND_SCORE * data.settings.rounds,
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
