import { BattleRoyaleElimination } from '@/app/(protected)/(game)/models/BattleRoyaleElimination'
import { BattleRoyaleGameSettings } from '@/app/(protected)/(game)/models/BattleRoyaleGameSettings'
import { MultiplayerRoundsData } from '@/app/(protected)/(game)/models/MultiplayerRoundsData'

/** State of a battle royale game, stored in `games.data`. */
export interface BattleRoyaleGameData extends MultiplayerRoundsData<BattleRoyaleGameSettings> {
  /** Players eliminated so far, in order. */
  eliminations: BattleRoyaleElimination[]
}
