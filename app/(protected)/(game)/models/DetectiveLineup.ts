/**
 * The suspects offered to the detective when it reaches the last stop (stored in
 * `games.data`): the thief and decoys, which the detective has to tell apart
 * with the traits the witnesses gave along the case.
 */
export interface DetectiveLineup {
  /** Seeds of the suspects (their look, see utils/suspects.ts), in the order they are shown. */
  seeds: number[]
  /** Index in `seeds` of the thief. */
  thief: number
  /** Index of the suspect the detective accused: null until it does. */
  accused: number | null
}
