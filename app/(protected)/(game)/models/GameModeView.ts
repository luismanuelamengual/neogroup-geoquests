import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettings } from '@/app/(protected)/(game)/models/GameSettings'
import { GameSettingsOptions } from '@/app/(protected)/(game)/models/GameSettingsOptions'

/** A game mode as shown in the main menu (the first choice of the player). */
export interface GameModeView {
  mode: GameMode
  /** Identifier in URLs (/play/[slug], /multiplayer/[slug]). */
  slug: string
  name: string
  description: string
  /** Image of the card (a path under /public). */
  image: string
  /** Only map of the mode (no map picker), or null when the player chooses it. */
  mapSlug: string | null
  minPlayers: number
  maxPlayers: number
  /** Default rules of the mode (rounds, time limit...). */
  settings: GameSettings
  /** Rules the player can choose when creating a game, with their allowed values. */
  configurable: GameSettingsOptions
}
