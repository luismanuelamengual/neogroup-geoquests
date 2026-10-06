import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import { SuspectTrait } from '@/app/(protected)/(game)/models/SuspectClue'

/**
 * The three difficulties of the detective mode: tune them here (see
 * DetectiveDifficultySettings for what each value does). Some things to keep
 * in mind:
 *   - `hops` clues about the thief are given in a case, one per stage, each
 *     of a different trait: `suspectTraits` needs more traits than `hops`
 *     (and the more, the better: not every thief shows all of them).
 *   - `witnessBudgetMinutes` should stay under `witnessMinutes`, so asking
 *     every witness leaves less time for mistakes.
 *   - The tests of the mode read the medium difficulty.
 */

const ALL_TRAITS: SuspectTrait[] = [
  'gender',
  'hairColor',
  'hairStyle',
  'eyeColor',
  'glasses',
  'facialHair',
  'headwear',
  'freckles',
  'earrings'
]

export const DETECTIVE_DIFFICULTIES: Record<DetectiveDifficulty, DetectiveDifficultySettings> = {
  easy: {
    hops: 4,
    minHopKm: 500,
    options: 3,
    decoyDistanceBands: [
      [0.5, 2],
      [0.25, 3],
      [0, Infinity]
    ],
    witnesses: 3,
    witnessMinutes: 60,
    witnessBudgetMinutes: 45,
    mistakesMargin: 1.5,
    maxMistakes: 2,
    suspects: 3,
    suspectTraits: ['gender', 'hairColor', 'hairStyle', 'eyeColor', 'glasses', 'headwear'],
    decoyContradictions: [0.6, 1]
  },
  medium: {
    hops: 5,
    minHopKm: 600,
    options: 4,
    decoyDistanceBands: [
      [0.6, 1.5],
      [0.35, 2.5],
      [0, Infinity]
    ],
    witnesses: 3,
    witnessMinutes: 120,
    witnessBudgetMinutes: 70,
    mistakesMargin: 1.25,
    maxMistakes: 2,
    suspects: 4,
    suspectTraits: ALL_TRAITS,
    decoyContradictions: [0, 0.5]
  },
  hard: {
    hops: 6,
    minHopKm: 700,
    options: 5,
    decoyDistanceBands: [
      [0.8, 1.25],
      [0.5, 2],
      [0, Infinity]
    ],
    witnesses: 3,
    witnessMinutes: 120,
    witnessBudgetMinutes: 60,
    mistakesMargin: 1.1,
    maxMistakes: 1,
    suspects: 5,
    suspectTraits: ALL_TRAITS,
    decoyContradictions: [0, 0.3]
  }
}

export const DEFAULT_DETECTIVE_DIFFICULTY: DetectiveDifficulty = 'medium'

/** The settings of a new case of a difficulty (anything that is not a difficulty gives the default one). */
export function getDetectiveGameSettings(difficulty: unknown): DetectiveGameSettings {
  const level =
    typeof difficulty === 'string' && difficulty in DETECTIVE_DIFFICULTIES
      ? (difficulty as DetectiveDifficulty)
      : DEFAULT_DETECTIVE_DIFFICULTY

  return { difficulty: level, ...structuredClone(DETECTIVE_DIFFICULTIES[level]) }
}
