import { RoundView } from '@/app/(protected)/(game)/models/RoundView'

/** What the player sees of a classic game (GameView.modeView). */
export interface ClassicGameView {
  roundsCount: number
  totalScore: number
  maxScore: number
  /** Round the player has to guess next; null when the game is finished. */
  currentRoundNumber: number | null
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds: number | null
  /**
   * Time left (ms) to guess the current round, as measured by the server when
   * it answered. Null when there is no limit or the round was not started yet.
   */
  roundTimeLeftMs: number | null
  rounds: RoundView[]
}
