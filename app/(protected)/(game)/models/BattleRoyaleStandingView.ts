/** Position of a player in a battle royale game: the survivors first, then by the round they fell in. */
export interface BattleRoyaleStandingView {
  userId: number
  /** 1 = the last one standing; players eliminated in the same round share the position. */
  position: number
  /** Points of all the rounds played (just informative: the position does not depend on them). */
  score: number
  /** Round in which the player was eliminated (null: still in the game). */
  eliminatedInRound: number | null
}
