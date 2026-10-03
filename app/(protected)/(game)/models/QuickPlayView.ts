import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { MapView } from '@/app/(protected)/(game)/models/MapView'

/** A quick game of the main menu: a game with fixed rules in a fixed map, started with a single tap. */
export interface QuickPlayView {
  /** Identifier of the quick game (e.g. "world-cities"). */
  key: string
  mode: GameMode
  map: MapView
  settings: Required<GameSettingsInput>
}
