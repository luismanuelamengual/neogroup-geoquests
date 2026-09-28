import { DB } from '@neogroup/neorm'

/**
 * Seeds the "Ciudades del mundo" quest (5 rounds, 2 minutes per round) and its
 * 20 places, linked through `quest_place`.
 *
 * Each place gets a GeoJSON `geometry` (see models/PlaceGeometry.ts). Most
 * cities are a circle (center + radius covering the urban core); three of them
 * (Buenos Aires, Manhattan and Paris) use a polygon, so both kinds of areas are
 * exercised from day one. Polygons are approximate outlines — random points
 * falling on water or parks are simply discarded by the location finder when no
 * street-level image is found there.
 *
 * Idempotent: skipped when the quest already exists.
 */
const QUEST = {
  name: 'Ciudades del mundo',
  description: 'Aparecés en una calle de una de 20 grandes ciudades. ¿Sabés cuál es y dónde estás?',
  rounds: 5,
  time: 2,
  image: '/quests/ciudades-del-mundo.png'
}

interface SeedPlace {
  name: string
  countryCode: string
  geometry:
    { type: 'Point'; coordinates: [number, number]; radius: number } | { type: 'Polygon'; coordinates: number[][][] }
}

/** Circle geometry: GeoJSON Point [longitude, latitude] + radius in meters. */
function circle(latitude: number, longitude: number, radius: number): SeedPlace['geometry'] {
  return { type: 'Point', coordinates: [longitude, latitude], radius }
}

/** Polygon geometry from its outer ring of [longitude, latitude] positions (first = last). */
function polygon(ring: number[][]): SeedPlace['geometry'] {
  return { type: 'Polygon', coordinates: [ring] }
}

const PLACES: SeedPlace[] = [
  {
    name: 'Buenos Aires',
    countryCode: 'AR',
    geometry: polygon([
      [-58.46, -34.535],
      [-58.413, -34.56],
      [-58.375, -34.585],
      [-58.362, -34.615],
      [-58.357, -34.635],
      [-58.39, -34.655],
      [-58.43, -34.68],
      [-58.462, -34.7],
      [-58.528, -34.655],
      [-58.53, -34.615],
      [-58.505, -34.56],
      [-58.46, -34.535]
    ])
  },
  { name: 'Mendoza', countryCode: 'AR', geometry: circle(-32.8895, -68.8458, 5000) },
  { name: 'Santiago de Chile', countryCode: 'CL', geometry: circle(-33.4489, -70.6693, 8000) },
  { name: 'São Paulo', countryCode: 'BR', geometry: circle(-23.5505, -46.6333, 10000) },
  { name: 'Ciudad de México', countryCode: 'MX', geometry: circle(19.4326, -99.1332, 9000) },
  {
    name: 'Nueva York (Manhattan)',
    countryCode: 'US',
    geometry: polygon([
      [-74.017, 40.701],
      [-73.971, 40.711],
      [-73.973, 40.743],
      [-73.958, 40.763],
      [-73.929, 40.796],
      [-73.934, 40.85],
      [-73.912, 40.875],
      [-73.928, 40.878],
      [-74.01, 40.755],
      [-74.017, 40.701]
    ])
  },
  { name: 'San Francisco', countryCode: 'US', geometry: circle(37.7749, -122.4194, 6000) },
  { name: 'Toronto', countryCode: 'CA', geometry: circle(43.6532, -79.3832, 8000) },
  { name: 'Londres', countryCode: 'GB', geometry: circle(51.5074, -0.1278, 10000) },
  {
    name: 'París',
    countryCode: 'FR',
    geometry: polygon([
      [2.254, 48.835],
      [2.279, 48.878],
      [2.32, 48.901],
      [2.396, 48.899],
      [2.413, 48.834],
      [2.39, 48.825],
      [2.32, 48.816],
      [2.254, 48.835]
    ])
  },
  { name: 'Madrid', countryCode: 'ES', geometry: circle(40.4168, -3.7038, 7000) },
  { name: 'Barcelona', countryCode: 'ES', geometry: circle(41.3874, 2.1686, 5000) },
  { name: 'Roma', countryCode: 'IT', geometry: circle(41.9028, 12.4964, 6000) },
  { name: 'Berlín', countryCode: 'DE', geometry: circle(52.52, 13.405, 9000) },
  { name: 'Ámsterdam', countryCode: 'NL', geometry: circle(52.3676, 4.9041, 5000) },
  { name: 'Lisboa', countryCode: 'PT', geometry: circle(38.7223, -9.1393, 4000) },
  { name: 'Praga', countryCode: 'CZ', geometry: circle(50.0755, 14.4378, 5000) },
  { name: 'Tokio', countryCode: 'JP', geometry: circle(35.6762, 139.6503, 12000) },
  { name: 'Sídney', countryCode: 'AU', geometry: circle(-33.8688, 151.2093, 8000) },
  { name: 'Ciudad del Cabo', countryCode: 'ZA', geometry: circle(-33.9249, 18.4241, 6000) }
]

export default {
  name: '002-seed-world-cities',

  async up(): Promise<void> {
    if (await DB.table('quests').where('name', QUEST.name).first()) {
      return
    }

    await DB.transaction(async () => {
      await DB.table('quests').insert({ ...QUEST, enabled: true })

      const quest = await DB.table('quests').where('name', QUEST.name).first()

      await DB.table('places').insert(
        PLACES.map((place) => ({
          name: place.name,
          countryCode: place.countryCode,
          geometry: JSON.stringify(place.geometry),
          enabled: true
        }))
      )

      const places = await DB.table('places')
        .whereIn(
          'name',
          PLACES.map((place) => place.name)
        )
        .get()

      await DB.table('quest_place').insert(places.map((place) => ({ questId: quest!.id, placeId: place.id })))
    })
  }
}
