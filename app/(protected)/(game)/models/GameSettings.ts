import { ClassicGameSettings } from '@/app/(protected)/(game)/models/ClassicGameSettings'
import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'

/** Settings of any game mode (one member per mode). */
export type GameSettings = ClassicGameSettings | ClassicMultiplayerGameSettings
