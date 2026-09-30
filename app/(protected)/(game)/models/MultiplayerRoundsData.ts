import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'
import { RoundPhase } from '@/app/(protected)/(game)/models/RoundPhase'

/**
 * State shared by the multiplayer round based modes (stored in `games.data`):
 * the rounds, the shared clock of the current one and everybody's guesses.
 * Each mode extends it with its own rules (e.g. the eliminations of battle royale).
 */
export interface MultiplayerRoundsData<Settings extends MultiplayerRoundsSettings = MultiplayerRoundsSettings> {
  /** Format version of this object. */
  v: 1
  settings: Settings
  /** Map the rounds are drawn from (they are chosen when the host starts the game). */
  mapId: number
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
  /** Guesses of each player (by user id), one entry per round: null while not guessed (or not playing it). */
  guesses: Record<string, (GameGuess | null)[]>
}
