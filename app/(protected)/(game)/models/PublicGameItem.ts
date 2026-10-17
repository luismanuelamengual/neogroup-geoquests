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
  /** Rounds of the game (null in the modes without a fixed number, e.g. battle royale). */
  roundsCount: number | null
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds: number | null
  /** Rounds played between one elimination and the next (battle royale only, else null). */
  roundsPerElimination: number | null
  createdAt: string
}
