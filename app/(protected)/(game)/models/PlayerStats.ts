/** Aggregated stats over the finished games of a player (games screen), kept forever (see PlayerProgress). */
export interface PlayerStats {
  gamesPlayed: number
  /** Detective cases in which the thief was caught. */
  casesSolved: number
  bestScore: number
  averageScore: number
  /** Days in a row with a finished game (0 once it is lost, see utils/streak.ts). */
  currentStreak: number
  bestStreak: number
  /** Streak freezes left: each one saves the streak from one missed day. */
  streakFreezes: number
  /** Whether a game was already finished today (the streak is safe until tomorrow). */
  playedToday: boolean
}
