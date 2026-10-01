import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GuessAction } from '@/app/(protected)/(game)/models/GuessAction'
import { MultiplayerGameView } from '@/app/(protected)/(game)/models/MultiplayerGameView'
import { MultiplayerRoundsData } from '@/app/(protected)/(game)/models/MultiplayerRoundsData'
import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'
import { MultiplayerRoundView } from '@/app/(protected)/(game)/models/MultiplayerRoundView'
import { PlayerGuessView } from '@/app/(protected)/(game)/models/PlayerGuessView'
import { PlayerStandingView } from '@/app/(protected)/(game)/models/PlayerStandingView'
import { RoundTiming } from '@/app/(protected)/(game)/models/RoundTiming'
import {
  evaluateGuess,
  getRoundTimeLeftMs,
  isRoundTimeOver,
  parseGuessPosition,
  timedOutGuess
} from '@/app/(protected)/(game)/utils/guesses'
import { ApiException } from '@/app/models/ApiException'

/**
 * Building blocks shared by the round based multiplayer modes (classic
 * multiplayer, battle royale): the shared clock of each round, presence,
 * guesses, closing a round, views and scoreboards. The mode engines combine
 * them with their own rules (who plays each round, what happens when it
 * closes, when the game ends).
 */

/**
 * A player is considered connected while it asked for the game within this
 * time (clients poll every ~1.5 s and the server records it every 10 s). A
 * round does not wait for disconnected players: it closes as soon as every
 * connected player guessed (or the time runs out).
 */
export const PRESENCE_TIMEOUT_MS = 20_000

/** Distance counted for a round without a guess, in the tiebreaker (half the Earth's circumference). */
export const MISSING_GUESS_DISTANCE_METERS = 20_037_508

/** Clock of a round from its start time (ISO) and time limit; null when either is missing. */
export function getRoundTiming(startedAt: string | null, timeLimitSeconds: number | null): RoundTiming | null {
  return startedAt && timeLimitSeconds != null ? { startedAt: new Date(startedAt), timeLimitSeconds } : null
}

/** Whether a player is still in the game and asked for it recently (see PRESENCE_TIMEOUT_MS). */
export function isPlayerConnected(player: GamePlayer, now: Date): boolean {
  return player.status === GamePlayerStatus.ACTIVE && now.getTime() - player.lastSeenAt.getTime() <= PRESENCE_TIMEOUT_MS
}

/** A guess as shown to everybody once its round is closed. */
export function toPlayerGuessView(userId: number, guess: GameGuess | null): PlayerGuessView {
  return {
    userId,
    guess:
      guess?.latitude != null && guess.longitude != null
        ? { latitude: guess.latitude, longitude: guess.longitude }
        : null,
    distanceMeters: guess?.distanceMeters ?? null,
    score: guess?.score ?? 0,
    timedOut: guess?.timedOut ?? true
  }
}

/**
 * Scoreboard of the given players from their guesses: the highest total score
 * first, the lowest total distance breaking ties (a round without a guess
 * counts as MISSING_GUESS_DISTANCE_METERS). Players with the same score and
 * distance share the position.
 */
export function rankPlayers(userIds: number[], guesses: Record<string, (GameGuess | null)[]>): PlayerStandingView[] {
  const entries = userIds.map((userId) => {
    const playerGuesses = guesses[String(userId)] ?? []

    return {
      userId,
      score: playerGuesses.reduce((total, guess) => total + (guess?.score ?? 0), 0),
      totalDistanceMeters: playerGuesses.reduce(
        (total, guess) => total + (guess ? (guess.distanceMeters ?? MISSING_GUESS_DISTANCE_METERS) : 0),
        0
      )
    }
  })

  entries.sort((a, b) => b.score - a.score || a.totalDistanceMeters - b.totalDistanceMeters)

  let position = 0

  return entries.map((entry, index) => {
    const previous = entries[index - 1]

    if (!previous || previous.score !== entry.score || previous.totalDistanceMeters !== entry.totalDistanceMeters) {
      position = index + 1
    }

    return { ...entry, position }
  })
}

/** State of a multiplayer game waiting for players: no rounds yet (they are chosen when it starts). */
export function createLobbyData<Settings extends MultiplayerRoundsSettings>(
  mapId: number,
  settings: Settings
): MultiplayerRoundsData<Settings> {
  return {
    v: 1,
    settings,
    mapId,
    phase: 'guessing',
    currentRound: 0,
    roundStartedAt: null,
    revealedAt: null,
    finished: false,
    rounds: [],
    guesses: {}
  }
}

/** Clock of the current round (null before the game starts). */
export function getCurrentTiming(data: MultiplayerRoundsData): RoundTiming | null {
  return getRoundTiming(data.roundStartedAt, data.settings.timeLimitSeconds)
}

/** Guess of a player for a round (null: not guessed, or not playing it). */
export function guessOf(data: MultiplayerRoundsData, userId: number, roundNumber: number): GameGuess | null {
  return data.guesses[String(userId)]?.[roundNumber - 1] ?? null
}

/** Starts a round: the same clock for everybody, after the countdown. */
export function beginRound(data: MultiplayerRoundsData, roundNumber: number, now: Date): void {
  data.currentRound = roundNumber
  data.phase = 'guessing'
  data.roundStartedAt = new Date(now.getTime() + data.settings.countdownSeconds * 1000).toISOString()
  data.revealedAt = null
}

/**
 * Whether the current round must close: every connected player of `playing`
 * guessed (the acting player counts as connected) or the time ran out.
 */
export function isRoundDone(
  data: MultiplayerRoundsData,
  playing: GamePlayer[],
  now: Date,
  actingUserId: number | null = null
): boolean {
  if (data.phase !== 'guessing' || data.currentRound === 0 || data.finished) {
    return false
  }

  const connected = playing.filter((player) => player.userId === actingUserId || isPlayerConnected(player, now))
  const everybodyGuessed =
    connected.length > 0 && connected.every((player) => guessOf(data, player.userId, data.currentRound) !== null)

  return everybodyGuessed || isRoundTimeOver(getCurrentTiming(data)!, now)
}

/** Closes the current round: the given players who did not guess score 0, and the result is shown. */
export function closeRound(data: MultiplayerRoundsData, userIds: number[], now: Date): void {
  const index = data.currentRound - 1

  for (const userId of userIds) {
    const playerGuesses = data.guesses[String(userId)]

    if (playerGuesses) {
      playerGuesses[index] = playerGuesses[index] ?? timedOutGuess()
    }
  }

  data.phase = 'reveal'
  data.revealedAt = now.toISOString()
}

/** Whether the result of the current round was shown long enough (revealSeconds). */
export function isRevealOver(data: MultiplayerRoundsData, now: Date): boolean {
  return (
    data.phase === 'reveal' &&
    !!data.revealedAt &&
    now.getTime() >= new Date(data.revealedAt).getTime() + data.settings.revealSeconds * 1000
  )
}

/**
 * Records the guess of one of the `playing` players for the current round
 * (validated: right round, started, not guessed yet), with its time.
 */
export function recordGuess(
  data: MultiplayerRoundsData,
  userId: number,
  action: GuessAction,
  playing: GamePlayer[],
  now: Date
): void {
  if (!playing.some((player) => player.userId === userId)) {
    throw new ApiException('errors.notPlayingThisRound', 403)
  }

  if (data.phase !== 'guessing' || Number(action.roundNumber) !== data.currentRound) {
    throw new ApiException('errors.roundAlreadyOver')
  }

  const timing = getCurrentTiming(data)!

  if (now < timing.startedAt) {
    throw new ApiException('errors.roundNotStarted')
  }

  if (guessOf(data, userId, data.currentRound)) {
    throw new ApiException('errors.roundAlreadyAnswered')
  }

  const position = parseGuessPosition(action.latitude, action.longitude)
  const index = data.currentRound - 1

  data.guesses[String(userId)][index] = {
    ...evaluateGuess(data.rounds[index], position, timing, now, data.settings.scoreMaxDistanceKm),
    guessedAt: now.toISOString()
  }
}

/** A round as the players see it: its answer and everybody's guesses only once it is closed. */
export function toMultiplayerRoundView(data: MultiplayerRoundsData, index: number): MultiplayerRoundView {
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
          .flatMap(([userId, playerGuesses]) =>
            // Players who did not play the round (e.g. already eliminated) have no guess for it.
            playerGuesses[index] ? [toPlayerGuessView(Number(userId), playerGuesses[index])] : []
          )
          .sort((a, b) => b.score - a.score || (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
      : []
  }
}

/** The part of the view every multiplayer round based mode shares (clocks, who guessed, rounds so far). */
export function toMultiplayerGameView(
  data: MultiplayerRoundsData,
  userId: number,
  limits: { minPlayers: number; maxPlayers: number },
  now: Date
): MultiplayerGameView {
  const started = data.currentRound > 0
  const guessing = started && !data.finished && data.phase === 'guessing'
  const timing = started ? getCurrentTiming(data) : null
  const revealEndsAt =
    data.phase === 'reveal' && data.revealedAt
      ? new Date(data.revealedAt).getTime() + data.settings.revealSeconds * 1000
      : null

  return {
    phase: data.phase,
    minPlayers: limits.minPlayers,
    maxPlayers: limits.maxPlayers,
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
    rounds: data.rounds.slice(0, data.currentRound).map((_, index) => toMultiplayerRoundView(data, index))
  }
}

/** Active players of the game when it starts: they get their (empty) guesses for every round. */
export function initGuesses(data: MultiplayerRoundsData, players: GamePlayer[]): void {
  data.guesses = Object.fromEntries(
    players
      .filter((player) => player.status === GamePlayerStatus.ACTIVE)
      .map((player) => [String(player.userId), data.rounds.map(() => null)])
  )
}
