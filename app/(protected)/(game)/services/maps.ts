import { Map } from '@/app/(protected)/(game)/models/Map'
import { MapPlace } from '@/app/(protected)/(game)/models/MapPlace'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { Place } from '@/app/(protected)/(game)/models/Place'

/** Enabled map by id, or null. */
export async function findMap(mapId: number): Promise<Map | null> {
  return Number.isInteger(mapId) ? Map.where('id', mapId).where('enabled', true).first() : null
}

/**
 * Enabled places of a map (linked through `map_places`).
 *
 * Read through the MapPlace entity, not a raw `DB.table()` query: on
 * PostgreSQL the columns are created unquoted and folded to lower case
 * (`placeid`), so raw rows don't have camelCase keys — entities map them.
 */
export async function getMapPlaces(mapId: number): Promise<Place[]> {
  const links = await MapPlace.where('mapId', mapId).get()
  const placeIds = links.map((link) => link.placeId)

  if (placeIds.length === 0) {
    return []
  }

  return Place.whereIn('id', placeIds).where('enabled', true).orderBy('id').get()
}

/** The playable maps (second step of the main menu): every enabled map with at least one enabled place. */
export async function getMaps(): Promise<MapView[]> {
  const maps = await Map.where('enabled', true).orderBy('id').get()
  const views = await Promise.all(
    maps.map(async (map) => ({
      id: map.id,
      name: map.name,
      description: map.description,
      image: map.image,
      placesCount: (await getMapPlaces(map.id)).length
    }))
  )

  return views.filter((view) => view.placesCount > 0)
}
