import { GameAction } from '@/app/(protected)/(game)/models/GameAction'

/** Payload of /api/sendGameAction. */
export interface GameActionInput {
  gameId: number
  action: GameAction
}
