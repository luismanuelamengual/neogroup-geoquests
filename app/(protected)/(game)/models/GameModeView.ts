import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** A game mode as shown in the main menu (the first choice of the player). */
export interface GameModeView {
  mode: GameMode
  /** Identifier in URLs (/play/[slug]). */
  slug: string
  name: string
  description: string
  /** Image of the card (a path under /public). */
  image: string
  minPlayers: number
  maxPlayers: number
  /** Quests that can be played in this mode. */
  questsCount: number
}
