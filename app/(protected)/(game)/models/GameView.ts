import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'

/**
 * Client view of a game of any mode: the common part plus `modeView`, built
 * by the mode engine with what this player is allowed to see (e.g.
 * ClassicGameView).
 */
export interface GameView<ModeView = unknown> {
  id: number
  mode: GameMode
  status: GameStatus
  questId: number | null
  questName: string | null
  /** Invitation code (multiplayer games waiting for players or being played). */
  code: string | null
  hostUserId: number | null
  /** Version of the game: sent back when polling (GetGameInput.sinceVersion). */
  version: number
  players: GamePlayerView[]
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  modeView: ModeView
}
