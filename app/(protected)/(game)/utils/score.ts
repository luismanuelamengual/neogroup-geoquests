import { ScoreSettings } from '@/app/(protected)/(game)/models/GameMode'

/**
 * Score of a round from the distance between the guess and the real location:
 *
 *   score = maxScore · e^(−distance / scaleMeters)
 *
 * rounded to an integer, with a full score inside `perfectDistanceMeters`.
 * Exponential decay (the same shape GeoGuessr uses) rewards precision close
 * to the target and quickly drops to 0 for guesses in the wrong region.
 */
export function calculateRoundScore(distanceMeters: number, settings: ScoreSettings): number {
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
