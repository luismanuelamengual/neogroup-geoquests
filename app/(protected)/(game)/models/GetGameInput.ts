/** Payload of /api/getGame. */
export interface GetGameInput {
  gameId: number
  /** Version the client already has: when the game did not change, the answer is `{ unchanged: true }`. */
  sinceVersion?: number | null
}
