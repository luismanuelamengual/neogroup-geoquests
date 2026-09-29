import { BattleRoyaleStandingView } from '@/app/(protected)/(game)/models/BattleRoyaleStandingView'
import { MultiplayerGameView } from '@/app/(protected)/(game)/models/MultiplayerGameView'

/** What a player sees of a battle royale game (GameView.modeView). */
export interface BattleRoyaleGameView extends MultiplayerGameView {
  /** Players still in the game. */
  aliveUserIds: number[]
  /** Whether the player looking was eliminated (it keeps watching the game). */
  isEliminated: boolean
  /** Players eliminated in the round being shown (phase "reveal"). */
  eliminatedThisRound: number[]
  /** Everybody's position: the survivors first, then by the round they fell in. */
  standings: BattleRoyaleStandingView[]
}
