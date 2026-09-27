import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** One round inside the encrypted game token (see services/gameTokens.ts). */
export interface GameStateRound {
  placeName: string
  countryCode: string
  imageId: string
  latitude: number
  longitude: number
  /** Set once the round was guessed. */
  guessLatitude?: number
  guessLongitude?: number
  distanceMeters?: number
  score?: number
}

/**
 * Full state of a game — including the answers of the rounds not played yet.
 * It never reaches the browser in clear: it travels encrypted as the game
 * token, which only the server can read.
 */
export interface GameState {
  /** Payload format version. */
  v: 1
  gameId: number
  userId: number
  mode: GameMode
  rounds: GameStateRound[]
}
