import { SuspectClue } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'

/** A witness of a stage (stored in `games.data`): who it is and which clue of the destination it knows. */
export interface DetectiveWitness {
  /** Seed of the generated character (its look and name): the same witness looks the same on every device. */
  seed: number
  role: WitnessRole
  /** Clue of the destination this witness gives (index in its LandmarkClues). */
  clueIndex: number
  /** Trait of the thief this witness also tells (one witness of every stage does; the others, null). */
  suspectClue?: SuspectClue | null
}
