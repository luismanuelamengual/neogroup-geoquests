import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'

/** Final result of a player, computed by the mode engine when the game ends (stored in `game_players`). */
export interface GamePlayerResult {
  userId: number
  score: number
  position: number | null
  outcome: GameOutcome | null
}
