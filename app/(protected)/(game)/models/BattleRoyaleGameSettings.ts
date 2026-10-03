import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/**
 * Settings of a battle royale game (the defaults of the mode, with the
 * time limit chosen by the player). There is no number of rounds: the game lasts until a single
 * player is left.
 */
export type BattleRoyaleGameSettings = MultiplayerRoundsSettings
