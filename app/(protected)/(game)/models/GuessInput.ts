/** Payload of /api/submitGuess. */
export interface GuessInput {
  gameId: number
  roundNumber: number
  latitude: number
  longitude: number
}
