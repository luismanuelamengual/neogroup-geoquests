/** Settings of a classic game (`quest_modes.settings` over the defaults of the mode). */
export interface ClassicGameSettings {
  rounds: number
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds: number | null
  /**
   * Distance (km) from which a guess scores 0 points: the bigger, the more
   * permissive the scoring (e.g. 3000). See utils/score.ts.
   */
  scoreMaxDistanceKm: number
}
