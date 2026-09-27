import { DB } from '@neogroup/neorm'

/**
 * Seeds the 20 places of the "Ciudades del mundo" game mode (GameMode.WORLD_CITIES = 1).
 *
 * Most cities are described as a circle (center + radius covering the urban
 * core); three of them (Buenos Aires, Manhattan and Paris) use a GeoJSON
 * polygon, so both kinds of areas are exercised from day one. Polygons are
 * approximate outlines — random points falling on water or parks are simply
 * discarded by the location finder when no street-level image is found there.
 *
 * Idempotent: skipped when the mode already has places.
 */
const WORLD_CITIES_MODE = 1

interface SeedPlace {
  name: string
  countryCode: string
  latitude: number
  longitude: number
  radiusMeters?: number
  polygon?: number[][]
}

const PLACES: SeedPlace[] = [
  {
    name: 'Buenos Aires',
    countryCode: 'AR',
    latitude: -34.6037,
    longitude: -58.4316,
    polygon: [
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
    ]
  },
  { name: 'Mendoza', countryCode: 'AR', latitude: -32.8895, longitude: -68.8458, radiusMeters: 5000 },
  { name: 'Santiago de Chile', countryCode: 'CL', latitude: -33.4489, longitude: -70.6693, radiusMeters: 8000 },
  { name: 'São Paulo', countryCode: 'BR', latitude: -23.5505, longitude: -46.6333, radiusMeters: 10000 },
  { name: 'Ciudad de México', countryCode: 'MX', latitude: 19.4326, longitude: -99.1332, radiusMeters: 9000 },
  {
    name: 'Nueva York (Manhattan)',
    countryCode: 'US',
    latitude: 40.7831,
    longitude: -73.9712,
    polygon: [
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
    ]
  },
  { name: 'San Francisco', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, radiusMeters: 6000 },
  { name: 'Toronto', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, radiusMeters: 8000 },
  { name: 'Londres', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, radiusMeters: 10000 },
  {
    name: 'París',
    countryCode: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    polygon: [
      [2.254, 48.835],
      [2.279, 48.878],
      [2.32, 48.901],
      [2.396, 48.899],
      [2.413, 48.834],
      [2.39, 48.825],
      [2.32, 48.816],
      [2.254, 48.835]
    ]
  },
  { name: 'Madrid', countryCode: 'ES', latitude: 40.4168, longitude: -3.7038, radiusMeters: 7000 },
  { name: 'Barcelona', countryCode: 'ES', latitude: 41.3874, longitude: 2.1686, radiusMeters: 5000 },
  { name: 'Roma', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, radiusMeters: 6000 },
  { name: 'Berlín', countryCode: 'DE', latitude: 52.52, longitude: 13.405, radiusMeters: 9000 },
  { name: 'Ámsterdam', countryCode: 'NL', latitude: 52.3676, longitude: 4.9041, radiusMeters: 5000 },
  { name: 'Lisboa', countryCode: 'PT', latitude: 38.7223, longitude: -9.1393, radiusMeters: 4000 },
  { name: 'Praga', countryCode: 'CZ', latitude: 50.0755, longitude: 14.4378, radiusMeters: 5000 },
  { name: 'Tokio', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, radiusMeters: 12000 },
  { name: 'Sídney', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, radiusMeters: 8000 },
  { name: 'Ciudad del Cabo', countryCode: 'ZA', latitude: -33.9249, longitude: 18.4241, radiusMeters: 6000 }
]

export default {
  name: '002-seed-world-cities',

  async up(): Promise<void> {
    const existing = await DB.table('places').where('mode', WORLD_CITIES_MODE).first()

    if (existing) {
      return
    }

    await DB.table('places').insert(
      PLACES.map((place) => ({
        name: place.name,
        countryCode: place.countryCode,
        mode: WORLD_CITIES_MODE,
        latitude: place.latitude,
        longitude: place.longitude,
        radiusMeters: place.radiusMeters ?? null,
        polygon: place.polygon ? JSON.stringify({ type: 'Polygon', coordinates: [place.polygon] }) : null,
        enabled: true
      }))
    )
  }
}
