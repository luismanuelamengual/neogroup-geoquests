import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/** Settings of a classic multiplayer game (the defaults of the mode, with the rules chosen by the player). */
export interface ClassicMultiplayerGameSettings extends MultiplayerRoundsSettings {
  rounds: number
}
