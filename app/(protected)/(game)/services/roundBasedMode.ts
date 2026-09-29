import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { PlayerGuessView } from '@/app/(protected)/(game)/models/PlayerGuessView'
import { PlayerStandingView } from '@/app/(protected)/(game)/models/PlayerStandingView'
import { RoundTiming } from '@/app/(protected)/(game)/models/RoundTiming'

/**
 * Building blocks shared by the round based multiplayer modes (classic
 * multiplayer today; battle royale tomorrow): clocks, presence, guesses and
 * scoreboards. The mode engines combine them with their own rules.
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
