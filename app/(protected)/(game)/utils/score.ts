/** Scoring curve — see calculateRoundScore. */
export interface ScoreSettings {
  /** Points of a perfect round. */
  maxScore: number
  /** Guesses closer than this (meters) get `maxScore`. */
  perfectDistanceMeters: number
  /** Distance (meters) at which the score decays to ~37% (1/e) of `maxScore`. */
  scaleMeters: number
}

/**
 * Scoring used by every quest. Tuned for city-sized places whose city is not
 * revealed: finding the right city already gives a good score, and
 * pinpointing the street inside it is what completes the 5000.
 */
export const SCORE_SETTINGS: ScoreSettings = { maxScore: 5000, perfectDistanceMeters: 25, scaleMeters: 15000 }

/** Points of a perfect round. */
export const MAX_ROUND_SCORE = SCORE_SETTINGS.maxScore

/**
 * Score of a round from the distance between the guess and the real location:
 *
 *   score = maxScore · e^(−distance / scaleMeters)
 *
 * rounded to an integer, with a full score inside `perfectDistanceMeters`.
 * Exponential decay (the same shape GeoGuessr uses) rewards precision close
 * to the target and quickly drops to 0 for guesses in the wrong region.
 */
export function calculateRoundScore(distanceMeters: number, settings: ScoreSettings = SCORE_SETTINGS): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return 0
  }

  if (distanceMeters <= settings.perfectDistanceMeters) {
    return settings.maxScore
  }

  return Math.round(settings.maxScore * Math.exp(-distanceMeters / settings.scaleMeters))
}

/** Human readable distance: "85 m", "1,2 km", "356 km", "12.345 km". */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`
  }

  const kilometers = distanceMeters / 1000

  if (kilometers < 10) {
    return `${kilometers.toLocaleString('es-AR', { maximumFractionDigits: 1 })} km`
  }

  return `${Math.round(kilometers).toLocaleString('es-AR')} km`
}

/** Integer score with thousands separator ("12.345"). */
export function formatScore(score: number): string {
  return Math.round(score).toLocaleString('es-AR')
}

/** "2 min", "1 min 30 s", "45 s" — time limit of a round. */
export function formatTimeLimit(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60

  if (minutes === 0) {
    return `${rest} s`
  }

  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`
}

/** Countdown clock: "1:05", "0:09". */
export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))

  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

/** Short verdict of a round, used by the result screen. */
export function getRoundVerdict(score: number, maxScore: number): string {
  const ratio = score / maxScore

  if (ratio >= 0.98) {
    return '¡PERFECTO!'
  }

  if (ratio >= 0.8) {
    return '¡Excelente!'
  }

  if (ratio >= 0.5) {
    return '¡Muy bien!'
  }

  if (ratio >= 0.2) {
    return 'Nada mal'
  }

  if (ratio > 0) {
    return 'Casi...'
  }

  return '¡Ups! Muy lejos'
}

/** Number of stars (0-3) earned by a whole game. */
export function getGameStars(totalScore: number, maxScore: number): number {
  const ratio = totalScore / maxScore

  if (ratio >= 0.8) {
    return 3
  }

  if (ratio >= 0.5) {
    return 2
  }

  if (ratio >= 0.2) {
    return 1
  }

  return 0
}
