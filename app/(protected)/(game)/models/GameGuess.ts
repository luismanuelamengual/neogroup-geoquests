/** A guess of a player for a round (stored in `games.data`). */
export interface GameGuess {
  /** Position guessed; null when the time ran out (or the guess arrived too late). */
  latitude: number | null
  longitude: number | null
  distanceMeters: number | null
  score: number
  /** True when the time ran out before the player guessed (the round scores 0). */
  timedOut: boolean
  /** When the guess was sent (ISO date; multiplayer modes, used to break ties). */
  guessedAt?: string
}
