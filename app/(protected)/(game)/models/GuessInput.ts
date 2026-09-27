/** Payload of /api/submitGuess. */
export interface GuessInput {
  /** Current game token (see GameSession). */
  token: string
  roundNumber: number
  latitude: number
  longitude: number
}
