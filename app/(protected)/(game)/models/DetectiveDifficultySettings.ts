import { SuspectTrait } from '@/app/(protected)/(game)/models/SuspectClue'

/**
 * Everything that sets how hard a detective case is. There is one object of
 * this type for each difficulty (see DETECTIVE_DIFFICULTIES in
 * utils/detectiveDifficulty.ts): tune the cases there.
 */
export interface DetectiveDifficultySettings {
  /* ---- the route ---- */
  /** Places the thief travels to after the crime scene (the detective reaches the last one to face the suspects). */
  hops: number
  /** Shortest distance (km) between two consecutive places of the route. */
  minHopKm: number
  /** Destinations offered to the detective at each stage (the right one and decoys). */
  options: number
  /**
   * Where the decoy destinations are looked for, from the preferred band to
   * the last resort: as a fraction of the distance to the right destination
   * ([0.6, 1.5] = from 60% to 150% of it). Decoys about as far as the right
   * destination make a mistake cost about the same whichever it is.
   */
  decoyDistanceBands: [number, number][]

  /* ---- witnesses ---- */
  /** Witnesses at each stage: each one knows one clue about the next destination, and one of them a trait of the thief. */
  witnesses: number
  /** Fictional minutes each witness costs. */
  witnessMinutes: number

  /* ---- time and mistakes ---- */
  /**
   * Minutes per witness the time limit of a case allows for. Less than
   * `witnessMinutes`: asking every witness eats into the margin for mistakes.
   */
  witnessBudgetMinutes: number
  /**
   * Spare time of a case in "average mistakes": the time limit allows the
   * perfect route (every witness asked) plus this many times the average
   * extra time a wrong destination costs.
   */
  mistakesMargin: number
  /** Wrong destinations allowed: the next one loses the trail of the thief (the case is lost). */
  maxMistakes: number

  /* ---- the suspects ---- */
  /** Suspects offered at the end (the thief and decoys): the detective has to point at the thief. */
  suspects: number
  /** Traits of the thief the witnesses can tell (one per stage, so at least `hops` of them are needed). */
  suspectTraits: SuspectTrait[]
  /**
   * How many of the clues each decoy suspect contradicts, as a fraction of the
   * clues given: [min, max] (at least one clue is always contradicted, so the
   * thief can be told). Lower = decoys more like the thief = harder.
   */
  decoyContradictions: [number, number]
}
