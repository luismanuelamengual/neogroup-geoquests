/** Settings of a classic game (`quest_modes.settings` over the defaults of the mode). */
export interface ClassicGameSettings {
  rounds: number
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds: number | null
  /**
   * Distance (km) at which a guess scores ~37% (1/e) of the maximum: small for
   * city quests (15 km), large for country quests (hundreds of km). See utils/score.ts.
   */
  scoreScaleKm: number
}
