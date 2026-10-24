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
   * the last resort: as a fraction of the distance of the hop (from where the
   * detective is to the right destination), measured from the RIGHT
   * destination ([0, 0.5] = within half of the hop of it). The closer the
   * decoys are to the right destination, the harder it is to tell it from them.
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

  /* ---- calls to the central office ---- */
  /** Calls to the central office the detective can make in a case (0: none; some events give one more). */
  centralCalls: number
  /** Fictional minutes each call costs. */
  centralCallMinutes: number
  /** Wrong destinations each call rules out (always leaving at least one, so there is still a choice). */
  centralCallEliminates: number

  /* ---- random events (see utils/detectiveEvents.ts) ---- */
  /** Chance (0 to 1) that something happens when the detective gets to a stage. */
  eventChance: number
  /** Chance (0 to 1) that, when something happens at a stage, a second thing happens too. */
  doubleEventChance: number
  /**
   * How much the events even out the case (0: not at all): the chance that an
   * event changes kind when it happens, per point of how far ahead or behind
   * of time the detective is (see rebalanceStageEvents). Missing in the cases
   * created before it existed: their events never change.
   */
  eventBalance: number
}
