import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/** Settings of a classic multiplayer game (fixed in the definition of the mode). */
export interface ClassicMultiplayerGameSettings extends MultiplayerRoundsSettings {
  rounds: number
}
