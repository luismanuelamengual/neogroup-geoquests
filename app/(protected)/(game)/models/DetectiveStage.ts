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
  /** Null until the detective travels. */
  travel: DetectiveTravel | null
}
