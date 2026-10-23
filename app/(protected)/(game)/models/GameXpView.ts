/** XP a finished game gave the player who is looking at it (see utils/xp.ts). */
export interface GameXpView {
  earned: number
  /** Total XP of the player right after the game (it had `total − earned` before). */
  total: number
}
