import { DetectiveEvent } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'
import { DetectiveTravel } from '@/app/(protected)/(game)/models/DetectiveTravel'
import { DetectiveWitness } from '@/app/(protected)/(game)/models/DetectiveWitness'

/**
 * A stage of a detective game (stored in `games.data`): the detective is at
 * the previous stop of the route, the suspect already went on to
 * `destination`, and the detective has to work out which of the `options` it is.
 */
export interface DetectiveStage {
  destination: DetectiveStop
  /** Destinations offered (shuffled): `destination` and the decoys. */
  options: DetectivePlace[]
  witnesses: DetectiveWitness[]
  /** Witnesses the detective already talked to (indices in `witnesses`, in order). */
  askedWitnesses: number[]
  /**
   * Random events of the stage (see utils/detectiveEvents.ts), planned with the
   * case and revealed when the detective gets to the stage. Missing in the cases
   * created before they existed.
   */
  events?: DetectiveEvent[]
  /** Wrong destinations ruled out (by an event or by calls to the central office): the detective can not travel there. */
  eliminated?: number[]
  /** Calls to the central office made from this stage. */
  calls?: number
  /** Null until the detective travels. */
  travel: DetectiveTravel | null
}
