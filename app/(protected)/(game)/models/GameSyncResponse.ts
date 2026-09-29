import { GameView } from '@/app/(protected)/(game)/models/GameView'

/** Response of /api/getGame: the game, or `unchanged` when it is still at the version the client has. */
export type GameSyncResponse = { unchanged: true } | { unchanged: false; game: GameView }
