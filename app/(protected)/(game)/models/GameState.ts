/** One round inside the encrypted game token (see services/gameTokens.ts). */
export interface GameStateRound {
  placeName: string
  countryCode: string
  imageId: string
  latitude: number
  longitude: number
  /** Set once the round was played. */
  guessLatitude?: number
  guessLongitude?: number
  distanceMeters?: number
  score?: number
  /** True when the time ran out (the round scores 0). */
  timedOut?: boolean
}

/**
 * Full state of a game — including the answers of the rounds not played yet.
 * It never reaches the browser in clear: it travels encrypted as the game
 * token, which only the server can read.
 */
export interface GameState {
  /** Payload format version. */
  v: 2
  gameId: number
  userId: number
  questId: number
  questName: string
  /** Time limit of each round in seconds, copied from the quest when the game started (null = no limit). */
  timeLimitSeconds: number | null
  rounds: GameStateRound[]
}
