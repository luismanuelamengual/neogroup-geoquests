import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/** Settings of a classic multiplayer game (`quest_modes.settings` over the defaults of the mode). */
export interface ClassicMultiplayerGameSettings extends MultiplayerRoundsSettings {
  rounds: number
}
