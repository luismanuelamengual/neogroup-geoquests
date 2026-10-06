import { MultiplayerRoundsSettings } from '@/app/(protected)/(game)/models/MultiplayerRoundsSettings'

/**
 * Settings of a battle royale game (the defaults of the mode, with the time
 * limit and the rounds per elimination chosen by the player). There is no
 * number of rounds: the game lasts until a single player is left.
 */
export interface BattleRoyaleGameSettings extends MultiplayerRoundsSettings {
  /**
   * Rounds played between one elimination and the next (1, 2 or 3). With more
   * than one, the points of those rounds are added up and whoever has the
   * fewest is eliminated; after each elimination the points start again from 0.
   * Games created before this rule existed do not have it (1).
   */
  roundsPerElimination: number
}
