import { GameAbandonAction } from '@/app/(protected)/(game)/models/GameAbandonAction'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsOptions } from '@/app/(protected)/(game)/models/GameSettingsOptions'

/** Static description of a game mode: what the generic game services need to know about it. */
export interface GameModeDefinition<Settings = unknown> {
  mode: GameMode
  /** Identifier of the mode in URLs (e.g. "classic" → /play/classic, "battle-royale" → /multiplayer/battle-royale). Always in English, like every path. */
  slug: string
  /** Name shown to the players (e.g. "Clásico"). */
  name: string
  /** What the mode is about, shown in the main menu. */
  description: string
  /** Image of the mode's card in the main menu: a path under /public. */
  image: string
  /** Players needed to start a game (1 = single player: the game starts as soon as it is created). */
  minPlayers: number
  /** Most players a game can have (1 = single player). */
  maxPlayers: number
  /** Whether the players' screens must be kept in sync (polling). */
  realtime: boolean
  /**
   * Default rules of the mode (rounds, time limit...). The player can change
   * the ones in `configurable` when creating a game, and a map can override
   * `scoreMaxDistanceKm`.
   */
  settings: Settings
  /** Rules the player can choose when creating a game, with their allowed values. */
  configurable: GameSettingsOptions
  /** A game in progress without any write for this long is considered abandoned. */
  abandonAfterMs: number
  abandonAction: GameAbandonAction
}
