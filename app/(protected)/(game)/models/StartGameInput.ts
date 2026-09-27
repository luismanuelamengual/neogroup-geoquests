import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** Payload of /api/startGame. */
export interface StartGameInput {
  mode: GameMode
}
