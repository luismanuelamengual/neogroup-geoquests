/** Payload of /api/getDailyLeaderboard: the challenge, by its id or by its day (none: today's). */
export interface DailyLeaderboardInput {
  challengeId?: number | null
  /** YYYY-MM-DD. */
  day?: string | null
}
