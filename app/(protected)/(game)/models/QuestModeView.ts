import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettings } from '@/app/(protected)/(game)/models/GameSettings'

/** A game mode offered by a quest, as shown in its card of the main menu. */
export interface QuestModeView {
  mode: GameMode
  name: string
  minPlayers: number
  maxPlayers: number
  settings: GameSettings
}
