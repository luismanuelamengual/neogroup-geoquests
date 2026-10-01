import { DEFAULT_LOCALE, Locale, LOCALE_TAGS } from '@/app/i18n/config'
import { createTranslator, Translator } from '@/app/i18n/translate'

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
export const DEFAULT_SCORE_MAX_DISTANCE_KM = 3000

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

/** Human readable distance: "85 m", "1,2 km", "356 km", "12.345 km" (decimal and thousands separators of the language). */
export function formatDistance(distanceMeters: number, locale: Locale = DEFAULT_LOCALE): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`
  }

  const kilometers = distanceMeters / 1000

  if (kilometers < 10) {
    return `${kilometers.toLocaleString(LOCALE_TAGS[locale], { maximumFractionDigits: 1 })} km`
  }

  return `${Math.round(kilometers).toLocaleString(LOCALE_TAGS[locale])} km`
}

/** Integer score with the thousands separator of the language ("12.345"). */
export function formatScore(score: number, locale: Locale = DEFAULT_LOCALE): string {
  return Math.round(score).toLocaleString(LOCALE_TAGS[locale])
}

/** "2 min", "1 min 30 s", "45 s" — time limit of a round. */
export function formatTimeLimit(seconds: number, t: Translator = createTranslator(DEFAULT_LOCALE)): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60

  if (minutes === 0) {
    return t('time.seconds', { count: rest })
  }

  return rest === 0 ? t('time.minutes', { count: minutes }) : t('time.minutesSeconds', { minutes, seconds: rest })
}

/** Countdown clock: "1:05", "0:09". */
export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))

  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

/** Short verdict of a round, used by the result screen. */
export function getRoundVerdict(
  score: number,
  maxScore: number,
  t: Translator = createTranslator(DEFAULT_LOCALE)
): string {
  const ratio = score / maxScore

  if (ratio >= 0.98) {
    return t('result.verdicts.perfect')
  }

  if (ratio >= 0.8) {
    return t('result.verdicts.excellent')
  }

  if (ratio >= 0.5) {
    return t('result.verdicts.veryGood')
  }

  if (ratio >= 0.2) {
    return t('result.verdicts.notBad')
  }

  if (ratio > 0) {
    return t('result.verdicts.almost')
  }

  return t('result.verdicts.oops')
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
