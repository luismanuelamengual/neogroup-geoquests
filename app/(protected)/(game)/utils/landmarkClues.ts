import { LANDMARK_CLUES } from '@/app/(protected)/(game)/data/landmarkClues'
import { LandmarkClues, LocalizedText } from '@/app/(protected)/(game)/models/LandmarkClues'
import { CLUE_KINDS, ClueKind } from '@/app/(protected)/(game)/models/WitnessRole'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { pickRandom, shuffle } from '@/app/(protected)/(game)/utils/random'
import { pickWeighted } from '@/app/(protected)/(game)/utils/seededRandom'
import { LOCALES } from '@/app/i18n/config'

/** Clues of every landmark (see models/LandmarkClues.ts for their order). */
export const CLUES_PER_LANDMARK = 5
/** Indices of the geography clues: every stage gets at least one of them, so it can always be solved. */
export const GEOGRAPHY_CLUES = [0, 1]
/** Indices of the clues of each kind (see models/LandmarkClues.ts). */
export const CLUES_BY_KIND: Record<ClueKind, number[]> = {
  geography: GEOGRAPHY_CLUES,
  culture: [2, 3],
  history: [4]
}

/** The kind of a clue (by its index). */
export function getClueKind(index: number): ClueKind {
  return CLUE_KINDS.find((kind) => CLUES_BY_KIND[kind].includes(index)) ?? 'history'
}

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

/** The clues a witness of a stage knows: the kind its job knows about, and the indices (the first one of that kind). */
export interface PlannedWitnessClues {
  kind: ClueKind
  clueIndices: number[]
}

/**
 * The clues of the witnesses of a stage: `count` witnesses (at most
 * CLUES_PER_LANDMARK: every one needs a clue of its own), each with a first
 * clue of its kind — one of them always of geography, so the stage can always
 * be solved — and, when `cluesPerWitness` is more than one, more clues (of its
 * kind while there are, then of any other) until the clues run out. No clue
 * is given twice. The witnesses come in random order.
 */
export function planWitnessClues(
  count: number,
  cluesPerWitness: number = 1,
  random: RandomFn = Math.random
): PlannedWitnessClues[] {
  const pools = Object.fromEntries(CLUE_KINDS.map((kind) => [kind, shuffle(CLUES_BY_KIND[kind], random)])) as Record<
    ClueKind,
    number[]
  >
  const witnesses: PlannedWitnessClues[] = []

  for (let index = 0; index < Math.min(count, CLUES_PER_LANDMARK); index++) {
    const available = CLUE_KINDS.filter((kind) => pools[kind].length > 0)
    const kind: ClueKind =
      index === 0
        ? 'geography'
        : pickWeighted(
            available.map((item) => [item, pools[item].length]),
            random
          )

    witnesses.push({ kind, clueIndices: [pools[kind].pop()!] })
  }

  for (let round = 1; round < cluesPerWitness; round++) {
    for (const witness of witnesses) {
      const kind =
        pools[witness.kind].length > 0
          ? witness.kind
          : pickRandom(
              CLUE_KINDS.filter((item) => pools[item].length > 0),
              random
            )

      if (kind) {
        witness.clueIndices.push(pools[kind].pop()!)
      }
    }
  }

  return shuffle(witnesses, random)
}
