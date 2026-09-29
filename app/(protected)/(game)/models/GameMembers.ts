import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'

/** Who takes part in a game, as the mode engines see it: its players (any status) and its host. */
export interface GameMembers {
  players: GamePlayer[]
  /** Host of a multiplayer game (null in single player games). */
  hostUserId: number | null
}
