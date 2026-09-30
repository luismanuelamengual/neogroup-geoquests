/** Scoring curve — see calculateRoundScore. */
export interface ScoreSettings {
  /** Points of a perfect round. */
  maxScore: number
  /** Guesses closer than this (meters) get `maxScore`. */
  perfectDistanceMeters: number
  /** Guesses at this distance (meters) or farther get 0 points. */
  maxDistanceMeters: number
}

/** Points of a perfect round and radius (meters) of the full score. */
export const SCORE_SETTINGS = { maxScore: 5000, perfectDistanceMeters: 25 }

/**
 * Default `scoreMaxDistanceKm` setting of the game modes (a map can override it
 * with its own `maps.scoreMaxDistanceKm`): the distance in km from which a
 * guess scores 0. The bigger it is, the more permissive the scoring.
 */
export const DEFAULT_SCORE_MAX_DISTANCE_KM = 2000

/** Points of a perfect round. */
export const MAX_ROUND_SCORE = SCORE_SETTINGS.maxScore

/** Scoring settings of a game from its `scoreMaxDistanceKm` setting. */
export function scoreSettingsFor(maxDistanceKm: number = DEFAULT_SCORE_MAX_DISTANCE_KM): ScoreSettings {
  return { ...SCORE_SETTINGS, maxDistanceMeters: maxDistanceKm * 1000 }
}

/**
 * Score of a round from the distance between the guess and the real location:
 *
 *   score = maxScore · e^(−distance / scale)
 *
 * rounded to an integer, with a full score inside `perfectDistanceMeters` and
 * 0 points from `maxDistanceMeters` on. The scale is derived from that maximum
 * distance so that the curve fades out right there (the last point is lost at
 * `maxDistanceMeters`). Exponential decay (the same shape GeoGuessr uses)
 * rewards precision close to the target.
 */
export function calculateRoundScore(distanceMeters: number, settings: ScoreSettings = scoreSettingsFor()): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return 0
  }

  if (distanceMeters <= settings.perfectDistanceMeters) {
    return settings.maxScore
  }

  if (distanceMeters >= settings.maxDistanceMeters) {
    return 0
  }

  const scaleMeters = settings.maxDistanceMeters / Math.log(settings.maxScore * 2)

  return Math.round(settings.maxScore * Math.exp(-distanceMeters / scaleMeters))
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
