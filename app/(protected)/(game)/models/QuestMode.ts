import { BaseEntity, Column, Entity } from '@neogroup/neorm'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/**
 * A game mode offered by a quest (`quest_modes` table), with its settings for
 * that quest (merged over the default settings of the mode).
 */
@Entity({ table: 'quest_modes' })
export class QuestMode extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  questId!: number

  @Column({ cast: 'number', primaryKey: true })
  mode!: GameMode

  @Column({ cast: 'json' })
  settings!: Record<string, unknown>

  @Column({ cast: 'boolean' })
  enabled!: boolean
}
