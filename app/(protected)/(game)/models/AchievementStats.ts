/**
 * Counters of the achievements that the other columns of `player_progress`
 * do not keep (stored in `player_progress.achievementStats`, see
 * utils/achievements.ts). Missing keys count as zero (or none).
 */
export interface AchievementStats {
  /** Classic modes: rounds whose guess fell in the right country (see utils/countries.ts). */
  rightCountries?: number
  /** Detective: right destinations chosen without asking any witness nor calling the central office there. */
  blindDestinations?: number
  /** Classic modes: continents (see utils/continents.ts) of the rounds guessed in the right country. */
  continents?: string[]
  /** Detective: stages with two random events, both bad. */
  badLuckStages?: number
  /** Detective: stages with two random events, both good. */
  goodLuckStages?: number
  /** Rounds of the landmarks map guessed less than ICONIC_PLACE_METERS away. */
  iconicPlaces?: number
  /** Finished games of each multiplayer mode. */
  classicMultiplayerGames?: number
  battleRoyaleGames?: number
}
