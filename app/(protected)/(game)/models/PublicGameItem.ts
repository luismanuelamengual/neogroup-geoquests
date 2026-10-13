import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** A public multiplayer game waiting for players, as listed in the "Multijugador" menu. */
export interface PublicGameItem {
  id: number
  mode: GameMode
  /** Slug of the mode (key of its name in the translations: `modes.<slug>.name`). */
  modeSlug: string
  mapSlug: string | null
  /** Name of the player who created the game (the host). */
  hostName: string
  playersCount: number
  maxPlayers: number
  createdAt: string
}
