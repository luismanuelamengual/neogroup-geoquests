/** Settings shared by the multiplayer round based modes (live rounds with the same clock for everybody). */
export interface MultiplayerRoundsSettings {
  /** Time limit of each round in seconds (always limited: everybody plays the same clock). */
  timeLimitSeconds: number
  /** Most players of a game (up to the mode's limit). */
  maxPlayers: number
  /** Seconds the result of a round is shown before the next one starts. */
  revealSeconds: number
  /** Seconds of countdown before each round. */
  countdownSeconds: number
  /**
   * Distance (km) at which a guess scores ~37% (1/e) of the maximum: small for
   * city quests (15 km), large for country quests (hundreds of km). See utils/score.ts.
   */
  scoreScaleKm: number
}
