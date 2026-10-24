/** Place of a score in the ranking of a daily challenge. */
export interface DailyRankView {
  /** 1 = best score of the day (equal scores share the place). */
  position: number
  /** Players who finished the challenge. */
  total: number
}
