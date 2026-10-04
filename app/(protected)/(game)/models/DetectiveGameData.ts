import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'

/**
 * How a detective case ended: caught, escaped (the time ran out) or lost
 * trail (too many wrong destinations, see MAX_MISTAKES in utils/detective.ts).
 */
export type DetectiveOutcome = 'caught' | 'escaped' | 'lostTrail'

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
  /** Stage being played (1-based); stages.length + 1 once the suspect was caught. */
  currentStage: number
  /** Fictional time the detective has spent (minutes since the case started). */
  elapsedMinutes: number
  /** Fictional time available for the whole case (minutes), computed from the route (see utils/detective.ts). */
  timeLimitMinutes: number
  /** Null while the case is open. */
  outcome: DetectiveOutcome | null
}
