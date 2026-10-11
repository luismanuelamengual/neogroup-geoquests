import { SuspectClue } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'

/**
 * A witness of a stage (stored in `games.data`): who it is and which clues of
 * the destination it knows. Its first clue is always of the kind its job knows
 * about (see ROLE_CLUE_KIND).
 */
export interface DetectiveWitness {
  /** Seed of the generated character (its look and name): the same witness looks the same on every device. */
  seed: number
  role: WitnessRole
  /** Clue of the destination this witness gives (index in its LandmarkClues). */
  clueIndex: number
  /**
   * More clues it gives after the first one (indices in its LandmarkClues): only
   * in the stages where the witnesses are talkative (see the event `talkative`).
   */
  extraClueIndices?: number[]
  /** Trait of the thief this witness also tells (usually one witness of every stage does; the others, null). */
  suspectClue?: SuspectClue | null
}
