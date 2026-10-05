/** Aggregated stats over the finished games of a player (games screen). */
export interface PlayerStats {
  gamesPlayed: number
  /** Detective cases in which the thief was caught. */
  casesSolved: number
  bestScore: number
  averageScore: number
}
