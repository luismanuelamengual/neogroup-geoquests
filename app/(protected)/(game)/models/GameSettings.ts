import { BattleRoyaleGameSettings } from '@/app/(protected)/(game)/models/BattleRoyaleGameSettings'
import { ClassicGameSettings } from '@/app/(protected)/(game)/models/ClassicGameSettings'
import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'

/** Settings of any game mode (one member per mode). */
export type GameSettings =
  ClassicGameSettings | ClassicMultiplayerGameSettings | BattleRoyaleGameSettings | DetectiveGameSettings
