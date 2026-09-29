import { ClassicGameSettings } from '@/app/(protected)/(game)/models/ClassicGameSettings'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'

/** State of a classic (single player) game, stored in `games.data`. */
export interface ClassicGameData {
  /** Format version of this object. */
  v: 1
  settings: ClassicGameSettings
  /** Round to guess next (1-based); rounds.length + 1 once the game is over. */
  currentRound: number
  /**
   * When the current round was shown to the player (ISO date; timed games
   * only). The time limit is measured from here, server side. Null until the
   * round starts; reset after every guess.
   */
  roundStartedAt: string | null
  rounds: GameRound[]
  /** One entry per round: null until the round is played. */
  guesses: (GameGuess | null)[]
}
