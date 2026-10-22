import { DailyRankView } from '@/app/(protected)/(game)/models/DailyRankView'

/** A row of the ranking of a daily challenge. */
export interface DailyLeaderboardEntry {
  position: number
  name: string
  score: number
  /** The player asking. */
  isMe: boolean
}

/** Ranking of a daily challenge (/api/getDailyLeaderboard): the best scores and the player's place. */
export interface DailyLeaderboardView {
  /** Null when nobody played the challenge of that day (it was never created). */
  challengeId: number | null
  number: number
  day: string
  mapSlug: string | null
  /** Whether it is today's challenge (it can still be played). */
  isToday: boolean
  /** The player's place (null if it did not finish the challenge). */
  me: (DailyRankView & { score: number }) | null
  top: DailyLeaderboardEntry[]
  /** The closest earlier day with a ranking (null: none). */
  previousDay: string | null
  /** The next day to look at, up to today (null: this is today's). */
  nextDay: string | null
}
