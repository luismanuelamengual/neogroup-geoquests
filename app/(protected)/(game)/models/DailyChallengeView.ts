import { DailyChallengeStatus } from '@/app/(protected)/(game)/models/DailyChallengeStatus'
import { DailyRankView } from '@/app/(protected)/(game)/models/DailyRankView'

/** Today's challenge as the player sees it in the menu (/api/getDailyChallenge). */
export interface DailyChallengeView {
  /** Number of the challenge (#1 was the first one). */
  number: number
  /** Day of the challenge (YYYY-MM-DD, in the time zone of the players). */
  day: string
  mapSlug: string | null
  roundsCount: number
  timeLimitSeconds: number
  status: DailyChallengeStatus
  /** The game of the player's attempt (in progress or finished), if it still exists. */
  gameId: number | null
  /** Finished attempt: its score and its place in the ranking of the day. */
  score: number | null
  maxScore: number
  rank: DailyRankView | null
  /** When the next challenge starts (ISO date). */
  nextChallengeAt: string
}
