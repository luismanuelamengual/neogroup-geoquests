import { BaseEntity, Column, Entity } from '@neogroup/neorm'

/** A medal a player won (`user_achievements`, see utils/achievements.ts): kept forever, like player_progress. */
@Entity({ table: 'user_achievements' })
export class UserAchievement extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  userId!: number

  /** Key of the medal: the achievement id, plus `.<tier>` when it has tiers (e.g. `steady.2`). */
  @Column({ primaryKey: true })
  key!: string

  @Column({ cast: 'date' })
  unlockedAt!: Date

  /** Game it was won in (it may have been deleted since); null: won from the progress of older games. */
  @Column({ cast: 'number' })
  gameId!: number | null
}
