import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'

/** Payload of /api/createGame. */
export interface CreateGameInput {
  /** Map to play in; ignored (may be missing) for the modes that have their own map (GameModeDefinition.mapSlug). */
  mapId?: number | null
  mode: GameMode
  /** Rules chosen by the player (missing: the defaults of the mode). */
  settings?: GameSettingsInput
}
