import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { RoundPhase } from '@/app/(protected)/(game)/models/RoundPhase'

/** State of a classic multiplayer game, stored in `games.data`. */
export interface ClassicMultiplayerGameData {
  /** Format version of this object. */
  v: 1
  settings: ClassicMultiplayerGameSettings
  /** Quest the rounds are drawn from (they are chosen when the host starts the game). */
  questId: number
  phase: RoundPhase
  /** Round being played or shown (1-based); 0 while waiting for players. */
  currentRound: number
  /**
   * When the current round starts, the same for everybody (ISO date). It is
   * in the future during the countdown; the time limit is measured from here.
   */
  roundStartedAt: string | null
  /** When the current round was closed (phase "reveal"). */
  revealedAt: string | null
  /** True once the result of the last round was shown: the game is over. */
  finished: boolean
  rounds: GameRound[]
  /** Guesses of each player (by user id), one entry per round: null until the player guesses. */
  guesses: Record<string, (GameGuess | null)[]>
}
