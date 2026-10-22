import { BaseEntity, Column, Entity } from '@neogroup/neorm'

/**
 * What a player built up over time (`player_progress`, one row per player):
 * counters updated when each of its games ends and never deleted, unlike the
 * games themselves (only the last 7 days are kept, see gameCleanup.ts).
 */
@Entity({ table: 'player_progress' })
export class PlayerProgress extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  userId!: number

  /** Finished games, of any mode. */
  @Column({ cast: 'number' })
  gamesPlayed!: number

  /** Finished games whose score counts for the best and the average (every mode but detective). */
  @Column({ cast: 'number' })
  scoredGames!: number

  @Column({ cast: 'number' })
  totalScore!: number

  @Column({ cast: 'number' })
  bestScore!: number

  /** Detective cases in which the thief was caught. */
  @Column({ cast: 'number' })
  casesSolved!: number

  /** Days in a row with a finished game, as of `lastPlayedDay` (see utils/streak.ts). */
  @Column({ cast: 'number' })
  currentStreak!: number

  @Column({ cast: 'number' })
  bestStreak!: number

  @Column({ cast: 'number' })
  streakFreezes!: number

  /** Last day with a finished game (YYYY-MM-DD, in the player's time zone). */
  @Column()
  lastPlayedDay!: string | null

  @Column({ cast: 'date' })
  updatedAt!: Date
}
