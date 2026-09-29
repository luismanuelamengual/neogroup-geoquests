/** Lifecycle of a game, common to every mode (stored as INTEGER in `games.status`). */
export enum GameStatus {
  /** Multiplayer games: waiting for players, not started yet. */
  LOBBY = 1,
  IN_PROGRESS = 2,
  FINISHED = 3
}
