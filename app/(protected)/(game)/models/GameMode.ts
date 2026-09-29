/**
 * Game modes (stored as INTEGER in `games.mode` and `quest_modes.mode`). Each
 * mode has its own engine (see services/gameModes.ts); a mode without an
 * engine registered yet is simply not offered.
 */
export enum GameMode {
  CLASSIC = 1,
  CLASSIC_MULTIPLAYER = 2,
  BATTLE_ROYALE = 3
}
