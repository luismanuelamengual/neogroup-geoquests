import { Game } from '@/app/(protected)/(game)/models/Game'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'

/** A game read from the database with its players (their users loaded). */
export interface LoadedGame {
  game: Game
  players: GamePlayer[]
}
