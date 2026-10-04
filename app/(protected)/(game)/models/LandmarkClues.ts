import type { Locale } from '@/app/i18n/config'

/** A text in every language of the app. */
export type LocalizedText = Record<Locale, string>

/**
 * The clues of a landmark (detective mode), in every language: exactly
 * CLUES_PER_LANDMARK of them, in a fixed order by kind (see utils/landmarkClues.ts):
 *   0, 1 → geography (region, climate, landscape)
 *   2, 3 → culture (language, money, food, customs)
 *   4    → specific (history, architecture of the place)
 * None names the place, its city or its country.
 */
export type LandmarkClues = Record<Locale, string[]>
