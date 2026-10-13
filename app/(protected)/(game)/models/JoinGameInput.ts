/** Payload of /api/joinGame: the invitation code of the game, or the id of a public game. */
export interface JoinGameInput {
  /** Invitation code of the game (as typed: it is normalized). */
  code?: string
  /** Id of a public game (they can be joined without their code). */
  gameId?: number
}
