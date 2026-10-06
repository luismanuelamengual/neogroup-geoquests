import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import { DetectiveLineup } from '@/app/(protected)/(game)/models/DetectiveLineup'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'

/**
 * How a detective case ended: caught (the right suspect was accused at the last
 * stop), escaped (the time ran out), lost trail (too many wrong destinations,
 * see `maxMistakes` in utils/detectiveDifficulty.ts) or wrong suspect (the detective got
 * to the last stop in time but accused someone else).
 */
export type DetectiveOutcome = 'caught' | 'escaped' | 'lostTrail' | 'wrongSuspect'

/** State of a detective (single player) game, stored in `games.data`. */
export interface DetectiveGameData {
  /** Format version of this object. */
  v: 1
  settings: DetectiveGameSettings
  /** What was stolen (index of the loot texts, see utils/detective.ts). */
  loot: number
  /** Crime scene: where the detective starts. */
  origin: DetectiveStop
  /** One stage per hop of the suspect. */
  stages: DetectiveStage[]
  /**
   * Stage being played (1-based); stages.length + 1 once the detective reached
   * the last stop: then it has to point at the thief among the lineup.
   */
  currentStage: number
  /**
   * Suspects of the last stop. Missing in the cases created before they existed:
   * those end as soon as the detective reaches the last stop.
   */
  lineup?: DetectiveLineup
  /** Moment the fictional clock started: minutes since Monday 0:00 (random, see randomCaseStartMinute). */
  startMinute: number
  /** Fictional time the detective has spent (minutes since the case started). */
  elapsedMinutes: number
  /** Fictional time available for the whole case (minutes), computed from the route (see utils/detective.ts). */
  timeLimitMinutes: number
  /** Null while the case is open. */
  outcome: DetectiveOutcome | null
}
