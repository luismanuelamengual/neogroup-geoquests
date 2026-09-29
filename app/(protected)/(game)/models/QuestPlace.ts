import { BaseEntity, Column, Entity } from '@neogroup/neorm'

/** Link between a quest and one of its places (`quest_places` table). */
@Entity({ table: 'quest_places' })
export class QuestPlace extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  questId!: number

  @Column({ cast: 'number', primaryKey: true })
  placeId!: number
}
