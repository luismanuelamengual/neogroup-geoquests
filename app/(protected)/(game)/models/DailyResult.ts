import { BaseEntity, BelongsTo, Column, Entity } from '@neogroup/neorm'
import { User } from '@/app/models/User'

/**
 * The attempt of a player at a daily challenge (`daily_results`, at most one
 * per player and challenge): created when the player starts it, with the
 * score once the game is finished: the ranking of the day. Deleted with its
 * challenge after 7 days (see gameCleanup.ts).
 */
@Entity({ table: 'daily_results' })
export class DailyResult extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  challengeId!: number

  @Column({ cast: 'number', primaryKey: true })
  userId!: number

  @Column({ cast: 'number' })
  gameId!: number | null

  /** Null until the game is finished. */
  @Column({ cast: 'number' })
  score!: number | null

  @Column({ cast: 'date' })
  startedAt!: Date

  @Column({ cast: 'date' })
  finishedAt!: Date | null

  @BelongsTo(() => User, 'userId')
  user?: User
}
