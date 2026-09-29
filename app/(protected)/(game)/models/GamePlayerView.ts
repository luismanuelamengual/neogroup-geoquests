import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'

/** A player of a game, as shown to the players. */
export interface GamePlayerView {
  userId: number
  name: string
  status: GamePlayerStatus
  /** Final score, position and outcome: set once the game is over. */
  score: number
  position: number | null
  outcome: GameOutcome | null
}
