import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** Payload of /api/createGame. */
export interface CreateGameInput {
  mapId: number
  mode: GameMode
}
