import { BattleRoyaleBlockScoreView } from '@/app/(protected)/(game)/models/BattleRoyaleBlockScoreView'
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
  /** Rounds played between one elimination and the next (the rule chosen when the game was created). */
  roundsPerElimination: number
  /** Number of the round being shown within the block that ends with an elimination (1-based). */
  roundInBlock: number
  /** Whether the round being shown is the one that ends with an elimination. */
  eliminationRound: boolean
  /** Points of the block of the round being shown, best first (only closed rounds count). */
  blockScores: BattleRoyaleBlockScoreView[]
  /** Everybody's position: the survivors first, then by the round they fell in. */
  standings: BattleRoyaleStandingView[]
}
