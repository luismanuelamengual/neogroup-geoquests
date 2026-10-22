/** The player's attempt at a daily challenge. */
export type DailyChallengeStatus =
  /** Not played yet. */
  | 'available'
  | 'inProgress'
  | 'finished'
  /** Started and left (or abandoned) before the end: the attempt is used. */
  | 'forfeited'
