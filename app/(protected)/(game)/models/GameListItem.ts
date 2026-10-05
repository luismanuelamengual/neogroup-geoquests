import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'

/** Row of the player's games list ("Mis partidas"). */
export interface GameListItem {
  id: number
  mode: GameMode
  /** Slug of the mode (key of its name in the translations: `modes.<slug>.name`). */
  modeSlug: string
  mapId: number | null
  mapName: string | null
  status: GameStatus
  playersCount: number
  score: number
  maxScore: number | null
  /** Position and outcome of the player, once the game is over. */
  position: number | null
  outcome: GameOutcome | null
  /** Steps (e.g. rounds) played, out of `totalSteps`. */
  completedSteps: number
  totalSteps: number
  createdAt: string
}
