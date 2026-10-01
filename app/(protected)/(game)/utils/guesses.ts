import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { RoundTiming } from '@/app/(protected)/(game)/models/RoundTiming'
import { haversineDistance, normalizeLongitude } from '@/app/(protected)/(game)/utils/geo'
import {
  calculateRoundScore,
  DEFAULT_SCORE_MAX_DISTANCE_KM,
  scoreSettingsFor
} from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/**
 * Extra time accepted after a round's time limit, to absorb network latency:
 * a guess sent by the client right when its countdown hits 0 still counts.
 */
export const ROUND_TIME_GRACE_MS = 5000

/**
 * Validates the position sent by a player: null when no pin was placed (both
 * coordinates null). Throws when the position is not a valid one.
 */
export function parseGuessPosition(latitude: unknown, longitude: unknown): LatLng | null {
  if (latitude == null && longitude == null) {
    return null
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  if (latitude == null || longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90) {
    throw new ApiException('errors.invalidPosition')
  }

  return { latitude: lat, longitude: normalizeLongitude(lng) }
}

/** Milliseconds left to play a timed round (never negative). */
export function getRoundTimeLeftMs(timing: RoundTiming, now: Date): number {
  return Math.max(0, timing.startedAt.getTime() + timing.timeLimitSeconds * 1000 - now.getTime())
}

/** Whether the time of a round ran out, grace period included. */
export function isRoundTimeOver(timing: RoundTiming, now: Date): boolean {
  return now.getTime() > timing.startedAt.getTime() + timing.timeLimitSeconds * 1000 + ROUND_TIME_GRACE_MS
}

/** A round played without a (valid) guess: the time ran out, it scores 0. */
export function timedOutGuess(): GameGuess {
  return { latitude: null, longitude: null, distanceMeters: null, score: 0, timedOut: true }
}

/**
 * Scores a guess for a round: distance to the real location and points (the
 * score is 0 from `scoreMaxDistanceKm`, see utils/score.ts). A missing guess, or
 * one arriving after the time limit (plus ROUND_TIME_GRACE_MS) of a timed
 * round, scores 0 as timed out.
 */
export function evaluateGuess(
  answer: LatLng,
  guess: LatLng | null,
  timing: RoundTiming | null,
  now: Date,
  scoreMaxDistanceKm = DEFAULT_SCORE_MAX_DISTANCE_KM
): GameGuess {
  if (!guess || (timing && isRoundTimeOver(timing, now))) {
    return timedOutGuess()
  }

  const distance = haversineDistance(answer, guess)

  return {
    latitude: guess.latitude,
    longitude: guess.longitude,
    distanceMeters: Math.round(distance * 10) / 10,
    score: calculateRoundScore(distance, scoreSettingsFor(scoreMaxDistanceKm)),
    timedOut: false
  }
}
