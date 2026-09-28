/** Payload of /api/submitGuess. */
export interface GuessInput {
  /** Current game token (see GameSession). */
  token: string
  roundNumber: number
  /** The player's guess; null when the time ran out before a pin was placed. */
  latitude: number | null
  longitude: number | null
}
