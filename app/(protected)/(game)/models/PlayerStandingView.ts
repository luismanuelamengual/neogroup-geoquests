/** Position of a player in the scoreboard of a multiplayer game. */
export interface PlayerStandingView {
  userId: number
  /** 1 = first; players with the same score and distance share it. */
  position: number
  score: number
  /** Sum of the distances of the guesses (tiebreaker: the lowest wins). */
  totalDistanceMeters: number
}
