/**
 * Settings of a map (`maps.settings`): the only rules a map can define, over
 * the ones of the game mode. The rest of the rules belong to the mode.
 */
export interface MapSettings {
  /**
   * Distance (km) from which a guess in this map scores 0 (see utils/score.ts).
   * It depends on the size of the region: a whole country needs a bigger scale
   * than a city. Missing: the one of the game mode.
   */
  scoreMaxDistanceKm?: number
}
