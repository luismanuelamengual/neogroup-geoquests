import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'

/** Payload of /api/createGame. */
export interface CreateGameInput {
  mapId: number
  mode: GameMode
  /** Rules chosen by the player (missing: the defaults of the mode). */
  settings?: GameSettingsInput
}
