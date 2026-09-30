import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/**
 * Settings of a battle royale game (fixed in the definition of the
 * mode). There is no number of rounds: the game lasts until a single
 * player is left.
 */
export type BattleRoyaleGameSettings = MultiplayerRoundsSettings
