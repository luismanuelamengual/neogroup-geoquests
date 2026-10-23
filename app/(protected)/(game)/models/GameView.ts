import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameXpView } from '@/app/(protected)/(game)/models/GameXpView'

/**
 * Client view of a game of any mode: the common part plus `modeView`, built
 * by the mode engine with what this player is allowed to see (e.g.
 * ClassicGameView).
 */
export interface GameView<ModeView = unknown> {
  id: number
  mode: GameMode
  status: GameStatus
  mapId: number | null
  mapSlug: string | null
  /** Invitation code (multiplayer games waiting for players or being played). */
  code: string | null
  hostUserId: number | null
  /** Multiplayer games anybody can join without the code (listed in the "Multijugador" menu). */
  isPublic: boolean
  /** The daily challenge the game is the attempt of (null: a normal game). */
  dailyChallengeId: number | null
  /** Version of the game: sent back when polling (GetGameInput.sinceVersion). */
  version: number
  players: GamePlayerView[]
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  /** XP the game gave this player: set once the game is over (null in the games finished before XP existed). */
  xp: GameXpView | null
  /** Medals this player won in the game (keys, see utils/achievements.ts); empty while it is being played. */
  achievements: string[]
  modeView: ModeView
}
