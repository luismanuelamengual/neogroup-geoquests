import { MultiplayerGameView } from '@/app/(protected)/(game)/models/MultiplayerGameView'
import { PlayerStandingView } from '@/app/(protected)/(game)/models/PlayerStandingView'

/** What a player sees of a classic multiplayer game (GameView.modeView). */
export interface ClassicMultiplayerGameView extends MultiplayerGameView {
  roundsCount: number
  maxScore: number
  standings: PlayerStandingView[]
}
