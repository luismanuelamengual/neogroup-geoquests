import { ClassicMultiplayerGameSettings } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameSettings'
import { MultiplayerRoundsData } from '@/app/(protected)/(game)/models/MultiplayerRoundsData'

/** State of a classic multiplayer game, stored in `games.data`. */
export type ClassicMultiplayerGameData = MultiplayerRoundsData<ClassicMultiplayerGameSettings>
