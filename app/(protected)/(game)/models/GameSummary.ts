/** Short summary of a game for one of its players (history list): score and progress. */
export interface GameSummary {
  score: number
  /** Best possible score (null when the mode has none). */
  maxScore: number | null
  /** Difficulty of the game, in the modes that have one (e.g. detective). */
  difficulty?: string
  /** Steps (e.g. rounds) already played, out of `totalSteps`. */
  completedSteps: number
  totalSteps: number
}
