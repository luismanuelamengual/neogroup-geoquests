/** The player's guess for a round; no position when the time ran out before a pin was placed. */
export interface GuessAction {
  type: 'guess'
  roundNumber: number
  latitude: number | null
  longitude: number | null
}
