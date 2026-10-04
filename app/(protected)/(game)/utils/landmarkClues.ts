import { LANDMARK_CLUES } from '@/app/(protected)/(game)/data/landmarkClues'
import { LandmarkClues, LocalizedText } from '@/app/(protected)/(game)/models/LandmarkClues'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { LOCALES } from '@/app/i18n/config'

/** Clues of every landmark (see models/LandmarkClues.ts for their order). */
export const CLUES_PER_LANDMARK = 5
/** Indices of the geography clues: every stage gets at least one of them, so it can always be solved. */
export const GEOGRAPHY_CLUES = [0, 1]

/** Clues of a landmark (by its name, as seeded), or null when it has none (it can't be a destination). */
export function getLandmarkClues(placeName: string): LandmarkClues | null {
  const clues = LANDMARK_CLUES[placeName]

  return clues && LOCALES.every((locale) => clues[locale]?.length === CLUES_PER_LANDMARK) ? clues : null
}

/** Whether a landmark has its clues (only those can be destinations of a detective case). */
export function hasLandmarkClues(placeName: string): boolean {
  return getLandmarkClues(placeName) !== null
}

/** A clue of a landmark in every language (null when missing). */
export function getLandmarkClue(placeName: string, index: number): LocalizedText | null {
  const clues = getLandmarkClues(placeName)

  if (!clues || index < 0 || index >= CLUES_PER_LANDMARK) {
    return null
  }

  return Object.fromEntries(LOCALES.map((locale) => [locale, clues[locale][index]])) as LocalizedText
}

/**
 * `count` different clues (indices) of the CLUES_PER_LANDMARK of a landmark,
 * at random, so the same place doesn't always give the same clues — with at
 * least one geography clue — in random order.
 */
export function pickClueIndices(count: number, random: RandomFn = Math.random): number[] {
  const geography = shuffle(GEOGRAPHY_CLUES, random)[0]
  const others = shuffle(
    Array.from({ length: CLUES_PER_LANDMARK }, (_, index) => index).filter((index) => index !== geography),
    random
  )

  return shuffle([geography, ...others.slice(0, Math.max(0, count - 1))], random)
}
