import { BaseEntity, Column, Entity } from '@neogroup/neorm'

/** Link between a map and one of its places (`map_places` table). */
@Entity({ table: 'map_places' })
export class MapPlace extends BaseEntity {
  @Column({ cast: 'number', primaryKey: true })
  mapId!: number

  @Column({ cast: 'number', primaryKey: true })
  placeId!: number
}
