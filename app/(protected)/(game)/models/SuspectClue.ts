/** Traits of the thief a witness can tell about (see utils/suspects.ts). */
export type SuspectTrait =
  'gender' | 'hairColor' | 'hairStyle' | 'eyeColor' | 'glasses' | 'facialHair' | 'headwear' | 'freckles' | 'earrings'

/**
 * A trait of the thief that a witness gives ("had green eyes"): the trait and
 * its value (the possible values of each trait are in utils/suspects.ts).
 * Shown as text through the dictionaries (detective.suspect.clues.{trait}.{value}).
 */
export interface SuspectClue {
  trait: SuspectTrait
  value: string
}
