/** A player eliminated from a battle royale game, and in which round. */
export interface BattleRoyaleElimination {
  userId: number
  roundNumber: number
  /**
   * True when the player fell because of the points of the block (the points of
   * everybody start again from 0 in the next round); false when it left the game.
   */
  scoresReset?: boolean
}
