import { BaseEntity, BelongsTo, Column, Entity } from '@neogroup/neorm'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { User } from '@/app/models/User'

/**
 * A player of a game (`game_players` table): one row per participant, also in
 * single player games. It is what stays of a game in the player's history:
 * `score`, `position` and `outcome` are set when the game ends.
 */
@Entity({ table: 'game_players' })
export class GamePlayer extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  gameId!: number

  @Column({ cast: 'number', primaryKey: true })
  userId!: number

  @Column({ cast: 'number' })
  status!: GamePlayerStatus

  /** Final score (0 while the game is being played). */
  @Column({ cast: 'number' })
  score!: number

  /** Final position (1 = first); null while the game is being played. */
  @Column({ cast: 'number' })
  position!: number | null

  /** Final result; null while the game is being played or when the mode has no winner. */
  @Column({ cast: 'number' })
  outcome!: GameOutcome | null

  @Column({ cast: 'date' })
  joinedAt!: Date

  /** Last time the player asked for the game (presence in real time modes). */
  @Column({ cast: 'date' })
  lastSeenAt!: Date

  @BelongsTo(() => User, 'userId')
  user?: User
}
