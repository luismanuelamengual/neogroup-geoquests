import { MultiplayerRoundView } from '@/app/(protected)/(game)/models/MultiplayerRoundView'
import { PlayerStandingView } from '@/app/(protected)/(game)/models/PlayerStandingView'
import { RoundPhase } from '@/app/(protected)/(game)/models/RoundPhase'

/** What a player sees of a classic multiplayer game (GameView.modeView). */
export interface ClassicMultiplayerGameView {
  phase: RoundPhase
  roundsCount: number
  maxScore: number
  minPlayers: number
  maxPlayers: number
  timeLimitSeconds: number
  /** Round being played or shown; null while waiting for players. */
  currentRoundNumber: number | null
  /** Time left (ms) until the current round starts (countdown); 0 once it started. */
  countdownMs: number
  /** Time left (ms) to guess the current round (phase "guessing", countdown not included). */
  roundTimeLeftMs: number | null
  /** Time left (ms) until the next round starts (phase "reveal"). */
  revealTimeLeftMs: number | null
  /** Whether this player already guessed the current round. */
  hasGuessed: boolean
  /** Players who already guessed the current round (never where). */
  guessedUserIds: number[]
  /** Rounds played so far (the current one included); later rounds are not sent. */
  rounds: MultiplayerRoundView[]
  standings: PlayerStandingView[]
}
