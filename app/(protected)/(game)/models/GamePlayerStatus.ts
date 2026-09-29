/** State of a player inside a game (stored as INTEGER in `game_players.status`). */
export enum GamePlayerStatus {
  ACTIVE = 1,
  /** The player left the game. */
  LEFT = 2
}
