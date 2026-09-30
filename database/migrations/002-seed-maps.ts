import { DB } from '@neogroup/neorm'
import { MapSettings } from '@/app/(protected)/(game)/models/MapSettings'

/**
 * Seeds the maps and their places:
 *
 *   - "Ciudades famosas": the 20 best known cities of the world (Paris, Rome,
 *     Buenos Aires...).
 *   - "Ciudades del mundo": 150 cities of 36 countries with good Street View
 *     coverage — capitals and big cities, but also medium and small ones (the
 *     20 famous cities included).
 *   - "Argentina", "España" and "Estados Unidos": a single place each — the
 *     whole (mainland) country as a polygon — so locations are drawn anywhere
 *     in its territory.
 *
 * A place is stored once and linked to every map that uses it
 * (`map_places`). The rules of the games (rounds, time limit...) are not
 * seeded: they belong to the game modes (see services/*Mode.ts).
 *
 * Each place gets a GeoJSON `geometry` (see models/PlaceGeometry.ts): most
 * cities are a circle (center + radius covering the urban core); three of them
 * (Buenos Aires, Manhattan and Paris) use a polygon, so both kinds of areas are
 * exercised. Radius and outlines are approximate — random points falling on
 * water or parks are simply discarded by the location finder when no
 * street-level image is found there.
 *
 * Idempotent: skipped when the maps already exist.
 */
interface SeedPlace {
  name: string
  countryCode: string
  /** Also part of "Ciudades famosas". */
  famous?: boolean
  /** Only part of this map (a whole country), not of "Ciudades del mundo". */
  onlyMap?: string
  geometry:
    { type: 'Point'; coordinates: [number, number]; radius: number } | { type: 'Polygon'; coordinates: number[][][] }
}

interface SeedMap {
  name: string
  description: string
  image: string | null
  places: (place: SeedPlace) => boolean
  /**
   * Settings of the map that override the ones of the game modes (e.g.
   * `{ scoreMaxDistanceKm: 3500 }`, see MapSettings). Null: the ones of the
   * modes, as in every seeded map.
   */
  settings: MapSettings | null
}

/** A map of a whole country: its only place is the country itself. */
function countryMap(name: string, description: string): SeedMap {
  return { name, description, image: null, places: (place) => place.onlyMap === name, settings: null }
}

const MAPS: SeedMap[] = [
  {
    name: 'Ciudades famosas',
    description:
      'Aparecés en una calle de una de las 20 ciudades más conocidas del mundo. ¿Sabés cuál es y dónde estás?',
    image: '/maps/ciudades-del-mundo.png',
    places: (place) => !!place.famous,
    settings: null
  },
  {
    name: 'Ciudades del mundo',
    description:
      '150 ciudades de 36 países: capitales, pero también ciudades medianas y chicas. ¿Te animás a reconocerlas?',
    image: null,
    places: (place) => !place.onlyMap,
    settings: null
  },
  countryMap(
    'Argentina',
    'Aparecés en cualquier lugar de la Argentina continental, de la Puna a Santa Cruz. ¿Dónde estás?'
  ),
  countryMap('España', 'Aparecés en cualquier lugar de la España peninsular, de Galicia a Andalucía. ¿Dónde estás?'),
  countryMap(
    'Estados Unidos',
    'Aparecés en cualquier lugar de los 48 estados continentales de Estados Unidos. ¿Dónde estás?'
  )
]

/** Circle geometry: GeoJSON Point [longitude, latitude] + radius in meters. */
function circle(latitude: number, longitude: number, radius: number): SeedPlace['geometry'] {
  return { type: 'Point', coordinates: [longitude, latitude], radius }
}

/** Polygon geometry from its outer ring of [longitude, latitude] positions (first = last). */
function polygon(ring: number[][]): SeedPlace['geometry'] {
  return { type: 'Polygon', coordinates: [ring] }
}

const PLACES: SeedPlace[] = [
  // Argentina
  {
    name: 'Buenos Aires',
    famous: true,
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
  { name: 'Córdoba', countryCode: 'AR', geometry: circle(-31.4201, -64.1888, 7000) },
  { name: 'Rosario', countryCode: 'AR', geometry: circle(-32.9442, -60.6505, 6000) },
  { name: 'Salta', countryCode: 'AR', geometry: circle(-24.7821, -65.4232, 4000) },
  { name: 'Mar del Plata', countryCode: 'AR', geometry: circle(-38.0055, -57.5426, 5000) },
  { name: 'San Carlos de Bariloche', countryCode: 'AR', geometry: circle(-41.1335, -71.3103, 3000) },
  // Chile
  { name: 'Santiago de Chile', countryCode: 'CL', famous: true, geometry: circle(-33.4489, -70.6693, 8000) },
  { name: 'Valparaíso', countryCode: 'CL', geometry: circle(-33.0472, -71.6127, 3000) },
  { name: 'Concepción', countryCode: 'CL', geometry: circle(-36.8201, -73.0444, 4000) },
  { name: 'La Serena', countryCode: 'CL', geometry: circle(-29.9027, -71.2519, 4000) },
  { name: 'Temuco', countryCode: 'CL', geometry: circle(-38.7359, -72.5904, 4000) },
  // Uruguay
  { name: 'Montevideo', countryCode: 'UY', geometry: circle(-34.9011, -56.1645, 6000) },
  { name: 'Punta del Este', countryCode: 'UY', geometry: circle(-34.962, -54.951, 3000) },
  { name: 'Colonia del Sacramento', countryCode: 'UY', geometry: circle(-34.4626, -57.8398, 2000) },
  // Brasil
  { name: 'São Paulo', countryCode: 'BR', famous: true, geometry: circle(-23.5505, -46.6333, 10000) },
  { name: 'Río de Janeiro', countryCode: 'BR', famous: true, geometry: circle(-22.9068, -43.1729, 8000) },
  { name: 'Belo Horizonte', countryCode: 'BR', geometry: circle(-19.9167, -43.9345, 7000) },
  { name: 'Curitiba', countryCode: 'BR', geometry: circle(-25.4284, -49.2733, 6000) },
  { name: 'Porto Alegre', countryCode: 'BR', geometry: circle(-30.0346, -51.2177, 6000) },
  { name: 'Salvador de Bahía', countryCode: 'BR', geometry: circle(-12.9777, -38.5016, 6000) },
  { name: 'Florianópolis', countryCode: 'BR', geometry: circle(-27.5954, -48.548, 4000) },
  // México
  { name: 'Ciudad de México', countryCode: 'MX', famous: true, geometry: circle(19.4326, -99.1332, 9000) },
  { name: 'Guadalajara', countryCode: 'MX', geometry: circle(20.6597, -103.3496, 7000) },
  { name: 'Monterrey', countryCode: 'MX', geometry: circle(25.6866, -100.3161, 7000) },
  { name: 'Puebla', countryCode: 'MX', geometry: circle(19.0414, -98.2063, 5000) },
  { name: 'Mérida', countryCode: 'MX', geometry: circle(20.9674, -89.5926, 5000) },
  { name: 'Oaxaca', countryCode: 'MX', geometry: circle(17.0732, -96.7266, 3000) },
  // Colombia
  { name: 'Bogotá', countryCode: 'CO', geometry: circle(4.711, -74.0721, 8000) },
  { name: 'Medellín', countryCode: 'CO', geometry: circle(6.2442, -75.5812, 6000) },
  { name: 'Cali', countryCode: 'CO', geometry: circle(3.4516, -76.532, 6000) },
  { name: 'Cartagena de Indias', countryCode: 'CO', geometry: circle(10.391, -75.4794, 4000) },
  // Perú
  { name: 'Lima', countryCode: 'PE', geometry: circle(-12.0464, -77.0428, 8000) },
  { name: 'Arequipa', countryCode: 'PE', geometry: circle(-16.409, -71.5375, 4000) },
  { name: 'Cusco', countryCode: 'PE', geometry: circle(-13.532, -71.9675, 3000) },
  { name: 'Trujillo', countryCode: 'PE', geometry: circle(-8.1091, -79.0215, 4000) },
  // Estados Unidos
  {
    name: 'Nueva York (Manhattan)',
    famous: true,
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
  { name: 'San Francisco', countryCode: 'US', famous: true, geometry: circle(37.7749, -122.4194, 6000) },
  { name: 'Chicago', countryCode: 'US', geometry: circle(41.8781, -87.6298, 8000) },
  { name: 'Los Ángeles', countryCode: 'US', geometry: circle(34.0522, -118.2437, 10000) },
  { name: 'Miami', countryCode: 'US', geometry: circle(25.7617, -80.1918, 6000) },
  { name: 'Seattle', countryCode: 'US', geometry: circle(47.6062, -122.3321, 6000) },
  { name: 'Boston', countryCode: 'US', geometry: circle(42.3601, -71.0589, 5000) },
  { name: 'Denver', countryCode: 'US', geometry: circle(39.7392, -104.9903, 6000) },
  { name: 'Nueva Orleans', countryCode: 'US', geometry: circle(29.9511, -90.0715, 5000) },
  { name: 'Austin', countryCode: 'US', geometry: circle(30.2672, -97.7431, 6000) },
  // Canadá
  { name: 'Toronto', countryCode: 'CA', famous: true, geometry: circle(43.6532, -79.3832, 8000) },
  { name: 'Montreal', countryCode: 'CA', geometry: circle(45.5017, -73.5673, 6000) },
  { name: 'Vancouver', countryCode: 'CA', geometry: circle(49.2827, -123.1207, 6000) },
  { name: 'Quebec', countryCode: 'CA', geometry: circle(46.8139, -71.208, 4000) },
  { name: 'Calgary', countryCode: 'CA', geometry: circle(51.0447, -114.0719, 6000) },
  // Reino Unido
  { name: 'Londres', countryCode: 'GB', famous: true, geometry: circle(51.5074, -0.1278, 10000) },
  { name: 'Mánchester', countryCode: 'GB', geometry: circle(53.4808, -2.2426, 5000) },
  { name: 'Edimburgo', countryCode: 'GB', geometry: circle(55.9533, -3.1883, 5000) },
  { name: 'Liverpool', countryCode: 'GB', geometry: circle(53.4084, -2.9916, 5000) },
  { name: 'Glasgow', countryCode: 'GB', geometry: circle(55.8642, -4.2518, 5000) },
  { name: 'Bristol', countryCode: 'GB', geometry: circle(51.4545, -2.5879, 4000) },
  // Irlanda
  { name: 'Dublín', countryCode: 'IE', geometry: circle(53.3498, -6.2603, 6000) },
  { name: 'Cork', countryCode: 'IE', geometry: circle(51.8985, -8.4756, 3000) },
  { name: 'Galway', countryCode: 'IE', geometry: circle(53.2707, -9.0568, 3000) },
  // Francia
  {
    name: 'París',
    famous: true,
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
  { name: 'Marsella', countryCode: 'FR', geometry: circle(43.2965, 5.3698, 6000) },
  { name: 'Lyon', countryCode: 'FR', geometry: circle(45.764, 4.8357, 5000) },
  { name: 'Burdeos', countryCode: 'FR', geometry: circle(44.8378, -0.5792, 5000) },
  { name: 'Niza', countryCode: 'FR', geometry: circle(43.7102, 7.262, 4000) },
  { name: 'Toulouse', countryCode: 'FR', geometry: circle(43.6047, 1.4442, 5000) },
  { name: 'Estrasburgo', countryCode: 'FR', geometry: circle(48.5734, 7.7521, 4000) },
  // España
  { name: 'Madrid', countryCode: 'ES', famous: true, geometry: circle(40.4168, -3.7038, 7000) },
  { name: 'Barcelona', countryCode: 'ES', famous: true, geometry: circle(41.3874, 2.1686, 5000) },
  { name: 'Sevilla', countryCode: 'ES', geometry: circle(37.3891, -5.9845, 5000) },
  { name: 'Valencia', countryCode: 'ES', geometry: circle(39.4699, -0.3763, 5000) },
  { name: 'Bilbao', countryCode: 'ES', geometry: circle(43.263, -2.935, 4000) },
  { name: 'Granada', countryCode: 'ES', geometry: circle(37.1773, -3.5986, 3000) },
  { name: 'Málaga', countryCode: 'ES', geometry: circle(36.7213, -4.4214, 4000) },
  // Portugal
  { name: 'Lisboa', countryCode: 'PT', famous: true, geometry: circle(38.7223, -9.1393, 4000) },
  { name: 'Oporto', countryCode: 'PT', geometry: circle(41.1579, -8.6291, 4000) },
  { name: 'Coímbra', countryCode: 'PT', geometry: circle(40.2033, -8.4103, 3000) },
  { name: 'Faro', countryCode: 'PT', geometry: circle(37.0194, -7.9304, 3000) },
  // Italia
  { name: 'Roma', countryCode: 'IT', famous: true, geometry: circle(41.9028, 12.4964, 6000) },
  { name: 'Milán', countryCode: 'IT', geometry: circle(45.4642, 9.19, 6000) },
  { name: 'Florencia', countryCode: 'IT', geometry: circle(43.7696, 11.2558, 4000) },
  { name: 'Nápoles', countryCode: 'IT', geometry: circle(40.8518, 14.2681, 5000) },
  { name: 'Turín', countryCode: 'IT', geometry: circle(45.0703, 7.6869, 5000) },
  { name: 'Bolonia', countryCode: 'IT', geometry: circle(44.4949, 11.3426, 4000) },
  { name: 'Palermo', countryCode: 'IT', geometry: circle(38.1157, 13.3615, 4000) },
  // Alemania
  { name: 'Berlín', countryCode: 'DE', famous: true, geometry: circle(52.52, 13.405, 9000) },
  { name: 'Múnich', countryCode: 'DE', geometry: circle(48.1351, 11.582, 6000) },
  { name: 'Hamburgo', countryCode: 'DE', geometry: circle(53.5511, 9.9937, 6000) },
  { name: 'Colonia', countryCode: 'DE', geometry: circle(50.9375, 6.9603, 5000) },
  { name: 'Fráncfort', countryCode: 'DE', geometry: circle(50.1109, 8.6821, 5000) },
  // Países Bajos
  { name: 'Ámsterdam', countryCode: 'NL', famous: true, geometry: circle(52.3676, 4.9041, 5000) },
  { name: 'Róterdam', countryCode: 'NL', geometry: circle(51.9244, 4.4777, 5000) },
  { name: 'Utrecht', countryCode: 'NL', geometry: circle(52.0907, 5.1214, 4000) },
  { name: 'La Haya', countryCode: 'NL', geometry: circle(52.0705, 4.3007, 4000) },
  // Bélgica
  { name: 'Bruselas', countryCode: 'BE', geometry: circle(50.8503, 4.3517, 5000) },
  { name: 'Amberes', countryCode: 'BE', geometry: circle(51.2194, 4.4025, 4000) },
  { name: 'Brujas', countryCode: 'BE', geometry: circle(51.2093, 3.2247, 2500) },
  { name: 'Gante', countryCode: 'BE', geometry: circle(51.0543, 3.7174, 3000) },
  // Suiza
  { name: 'Zúrich', countryCode: 'CH', geometry: circle(47.3769, 8.5417, 4000) },
  { name: 'Ginebra', countryCode: 'CH', geometry: circle(46.2044, 6.1432, 4000) },
  { name: 'Berna', countryCode: 'CH', geometry: circle(46.948, 7.4474, 3000) },
  // Austria
  { name: 'Viena', countryCode: 'AT', geometry: circle(48.2082, 16.3738, 6000) },
  { name: 'Salzburgo', countryCode: 'AT', geometry: circle(47.8095, 13.055, 3000) },
  { name: 'Innsbruck', countryCode: 'AT', geometry: circle(47.2692, 11.4041, 3000) },
  // Chequia y Hungría
  { name: 'Praga', countryCode: 'CZ', famous: true, geometry: circle(50.0755, 14.4378, 5000) },
  { name: 'Brno', countryCode: 'CZ', geometry: circle(49.1951, 16.6068, 4000) },
  { name: 'Budapest', countryCode: 'HU', geometry: circle(47.4979, 19.0402, 6000) },
  // Polonia
  { name: 'Varsovia', countryCode: 'PL', geometry: circle(52.2297, 21.0122, 6000) },
  { name: 'Cracovia', countryCode: 'PL', geometry: circle(50.0647, 19.945, 5000) },
  { name: 'Gdansk', countryCode: 'PL', geometry: circle(54.352, 18.6466, 5000) },
  { name: 'Breslavia', countryCode: 'PL', geometry: circle(51.1079, 17.0385, 5000) },
  // Países nórdicos
  { name: 'Estocolmo', countryCode: 'SE', geometry: circle(59.3293, 18.0686, 6000) },
  { name: 'Gotemburgo', countryCode: 'SE', geometry: circle(57.7089, 11.9746, 5000) },
  { name: 'Malmö', countryCode: 'SE', geometry: circle(55.605, 13.0038, 4000) },
  { name: 'Oslo', countryCode: 'NO', geometry: circle(59.9139, 10.7522, 5000) },
  { name: 'Bergen', countryCode: 'NO', geometry: circle(60.3913, 5.3221, 4000) },
  { name: 'Copenhague', countryCode: 'DK', geometry: circle(55.6761, 12.5683, 5000) },
  { name: 'Aarhus', countryCode: 'DK', geometry: circle(56.1629, 10.2039, 4000) },
  { name: 'Helsinki', countryCode: 'FI', geometry: circle(60.1699, 24.9384, 5000) },
  { name: 'Tampere', countryCode: 'FI', geometry: circle(61.4978, 23.761, 4000) },
  { name: 'Reikiavik', countryCode: 'IS', geometry: circle(64.1466, -21.9426, 4000) },
  // Grecia y Turquía
  { name: 'Atenas', countryCode: 'GR', geometry: circle(37.9838, 23.7275, 6000) },
  { name: 'Tesalónica', countryCode: 'GR', geometry: circle(40.6401, 22.9444, 4000) },
  { name: 'Estambul', countryCode: 'TR', geometry: circle(41.0082, 28.9784, 8000) },
  // Japón
  { name: 'Tokio', countryCode: 'JP', famous: true, geometry: circle(35.6762, 139.6503, 12000) },
  { name: 'Osaka', countryCode: 'JP', geometry: circle(34.6937, 135.5023, 7000) },
  { name: 'Kioto', countryCode: 'JP', geometry: circle(35.0116, 135.7681, 5000) },
  { name: 'Sapporo', countryCode: 'JP', geometry: circle(43.0618, 141.3545, 6000) },
  { name: 'Fukuoka', countryCode: 'JP', geometry: circle(33.5904, 130.4017, 5000) },
  { name: 'Nagoya', countryCode: 'JP', geometry: circle(35.1815, 136.9066, 6000) },
  { name: 'Hiroshima', countryCode: 'JP', geometry: circle(34.3853, 132.4553, 4000) },
  // Taiwán y Tailandia
  { name: 'Taipéi', countryCode: 'TW', geometry: circle(25.033, 121.5654, 6000) },
  { name: 'Kaohsiung', countryCode: 'TW', geometry: circle(22.6273, 120.3014, 5000) },
  { name: 'Bangkok', countryCode: 'TH', geometry: circle(13.7563, 100.5018, 8000) },
  { name: 'Chiang Mai', countryCode: 'TH', geometry: circle(18.7883, 98.9853, 4000) },
  { name: 'Phuket', countryCode: 'TH', geometry: circle(7.8804, 98.3923, 3000) },
  // Australia
  { name: 'Sídney', countryCode: 'AU', famous: true, geometry: circle(-33.8688, 151.2093, 8000) },
  { name: 'Melbourne', countryCode: 'AU', geometry: circle(-37.8136, 144.9631, 7000) },
  { name: 'Brisbane', countryCode: 'AU', geometry: circle(-27.4698, 153.0251, 6000) },
  { name: 'Perth', countryCode: 'AU', geometry: circle(-31.9505, 115.8605, 6000) },
  { name: 'Adelaida', countryCode: 'AU', geometry: circle(-34.9285, 138.6007, 5000) },
  { name: 'Hobart', countryCode: 'AU', geometry: circle(-42.8821, 147.3272, 3000) },
  // Nueva Zelanda
  { name: 'Auckland', countryCode: 'NZ', geometry: circle(-36.8485, 174.7633, 6000) },
  { name: 'Wellington', countryCode: 'NZ', geometry: circle(-41.2865, 174.7762, 4000) },
  { name: 'Christchurch', countryCode: 'NZ', geometry: circle(-43.5321, 172.6362, 5000) },
  { name: 'Queenstown', countryCode: 'NZ', geometry: circle(-45.0312, 168.6626, 2500) },
  // Sudáfrica
  { name: 'Ciudad del Cabo', countryCode: 'ZA', famous: true, geometry: circle(-33.9249, 18.4241, 6000) },
  { name: 'Johannesburgo', countryCode: 'ZA', geometry: circle(-26.2041, 28.0473, 8000) },
  { name: 'Durban', countryCode: 'ZA', geometry: circle(-29.8587, 31.0218, 6000) },
  { name: 'Pretoria', countryCode: 'ZA', geometry: circle(-25.7479, 28.2293, 6000) },
  // Whole countries: the only place of their map (not part of "Ciudades del mundo").
  // Approximate outlines of the mainland, drawn slightly inside the land borders so that
  // panoramas found near a border are never on the other side.
  {
    name: 'Argentina',
    countryCode: 'AR',
    onlyMap: 'Argentina',
    geometry: polygon([
      [-65.6, -22.15],
      [-64.8, -22.15],
      [-64.4, -22.75],
      [-63.9, -22.05],
      [-62.75, -22.2],
      [-61.3, -23.1],
      [-60.1, -23.85],
      [-58.8, -24.75],
      [-57.8, -25.35],
      [-58.2, -26.2],
      [-58.65, -27.3],
      [-57.0, -27.5],
      [-55.95, -27.42],
      [-55.3, -27.05],
      [-54.72, -26.4],
      [-54.6, -25.65],
      [-53.9, -25.7],
      [-53.7, -26.3],
      [-53.8, -27.15],
      [-55.0, -27.9],
      [-56.1, -28.6],
      [-57.15, -29.75],
      [-57.7, -30.3],
      [-58.07, -31.4],
      [-58.2, -32.25],
      [-58.4, -33.1],
      [-58.45, -33.9],
      [-58.58, -34.42],
      [-58.37, -34.6],
      [-57.9, -34.85],
      [-57.15, -35.4],
      [-57.35, -35.9],
      [-56.7, -36.3],
      [-56.7, -36.9],
      [-57.53, -38.0],
      [-58.73, -38.57],
      [-61.3, -39.0],
      [-62.26, -38.8],
      [-62.1, -39.2],
      [-62.4, -40.2],
      [-62.8, -41.05],
      [-64.0, -40.9],
      [-64.95, -40.73],
      [-65.1, -41.5],
      [-64.3, -42.4],
      [-63.6, -42.8],
      [-64.1, -42.95],
      [-65.03, -42.77],
      [-65.0, -43.4],
      [-65.3, -44.1],
      [-65.6, -45.0],
      [-67.3, -45.4],
      [-67.48, -45.87],
      [-67.52, -46.44],
      [-66.0, -47.0],
      [-65.8, -47.1],
      [-65.9, -47.75],
      [-66.4, -48.3],
      [-67.72, -49.3],
      [-68.4, -50.1],
      [-69.2, -51.62],
      [-68.35, -52.33],
      [-70.0, -52.05],
      [-71.9, -52.05],
      [-72.3, -51.3],
      [-72.8, -50.3],
      [-73.0, -49.3],
      [-72.4, -48.3],
      [-72.1, -47.2],
      [-71.8, -46.5],
      [-71.8, -45.8],
      [-71.6, -44.8],
      [-71.8, -43.8],
      [-71.8, -42.8],
      [-71.8, -41.8],
      [-71.8, -41.0],
      [-71.7, -40.5],
      [-71.5, -39.3],
      [-71.1, -38.3],
      [-70.9, -37.0],
      [-70.5, -36.1],
      [-70.4, -35.0],
      [-70.1, -34.0],
      [-70.0, -33.0],
      [-70.3, -32.0],
      [-70.2, -31.0],
      [-69.8, -30.0],
      [-69.4, -29.0],
      [-68.9, -28.0],
      [-68.5, -27.2],
      [-68.4, -26.5],
      [-68.4, -25.5],
      [-67.5, -24.4],
      [-67.2, -23.6],
      [-66.8, -22.5],
      [-66.2, -22.15],
      [-65.6, -22.15]
    ])
  },
  {
    name: 'España',
    countryCode: 'ES',
    onlyMap: 'España',
    geometry: polygon([
      [-8.87, 41.9],
      [-8.64, 42.03],
      [-8.2, 42.1],
      [-7.9, 41.92],
      [-7.2, 41.95],
      [-6.6, 41.98],
      [-6.2, 41.62],
      [-6.8, 41.08],
      [-6.85, 40.3],
      [-7.0, 39.75],
      [-7.45, 39.62],
      [-7.0, 39.1],
      [-7.05, 38.87],
      [-7.25, 38.4],
      [-7.0, 38.05],
      [-7.4, 37.55],
      [-7.35, 37.2],
      [-6.95, 37.2],
      [-6.4, 36.8],
      [-6.3, 36.53],
      [-5.6, 36.01],
      [-5.45, 36.13],
      [-4.9, 36.5],
      [-4.42, 36.7],
      [-3.5, 36.72],
      [-2.46, 36.83],
      [-2.19, 36.72],
      [-1.9, 37.2],
      [-0.98, 37.6],
      [-0.7, 37.63],
      [-0.75, 37.9],
      [-0.48, 38.34],
      [0.23, 38.73],
      [-0.33, 39.47],
      [0.0, 39.97],
      [0.5, 40.5],
      [0.87, 40.7],
      [1.3, 41.05],
      [2.2, 41.3],
      [2.5, 41.5],
      [3.2, 41.9],
      [3.32, 42.32],
      [3.1, 42.42],
      [2.5, 42.35],
      [1.8, 42.4],
      [1.4, 42.4],
      [0.7, 42.68],
      [0.0, 42.68],
      [-0.8, 42.8],
      [-1.4, 43.0],
      [-1.75, 43.3],
      [-1.98, 43.32],
      [-2.93, 43.4],
      [-3.8, 43.46],
      [-4.8, 43.42],
      [-5.66, 43.55],
      [-5.85, 43.66],
      [-7.0, 43.56],
      [-7.68, 43.75],
      [-8.3, 43.5],
      [-8.4, 43.37],
      [-9.27, 42.88],
      [-8.9, 42.6],
      [-8.72, 42.24],
      [-8.87, 41.9]
    ])
  },
  {
    name: 'Estados Unidos',
    countryCode: 'US',
    onlyMap: 'Estados Unidos',
    geometry: polygon([
      [-124.7, 48.38],
      [-123.2, 48.15],
      [-122.7, 48.2],
      [-122.75, 48.95],
      [-95.2, 48.95],
      [-94.8, 48.7],
      [-93.2, 48.55],
      [-90.8, 48.15],
      [-89.6, 47.99],
      [-91.0, 47.2],
      [-92.1, 46.75],
      [-90.9, 46.6],
      [-87.4, 46.5],
      [-85.0, 46.75],
      [-84.35, 46.45],
      [-84.5, 45.8],
      [-83.4, 45.05],
      [-83.3, 44.0],
      [-82.5, 43.0],
      [-83.05, 42.33],
      [-83.5, 41.7],
      [-81.7, 41.5],
      [-80.1, 42.13],
      [-78.9, 42.85],
      [-79.0, 43.25],
      [-77.6, 43.25],
      [-76.5, 43.45],
      [-76.2, 44.15],
      [-75.3, 44.85],
      [-74.7, 44.95],
      [-71.5, 44.95],
      [-70.8, 45.4],
      [-70.3, 45.9],
      [-70.0, 46.7],
      [-69.2, 47.4],
      [-68.3, 47.3],
      [-67.85, 47.0],
      [-67.85, 45.7],
      [-67.2, 45.15],
      [-67.0, 44.8],
      [-68.2, 44.4],
      [-69.8, 43.8],
      [-70.25, 43.65],
      [-70.8, 42.9],
      [-71.0, 42.35],
      [-70.0, 41.9],
      [-70.0, 41.7],
      [-70.6, 41.5],
      [-71.4, 41.45],
      [-72.9, 41.25],
      [-74.0, 40.6],
      [-74.0, 40.3],
      [-74.4, 39.35],
      [-74.95, 38.93],
      [-75.1, 38.45],
      [-75.4, 37.9],
      [-75.97, 36.85],
      [-75.5, 35.25],
      [-76.6, 34.7],
      [-77.8, 34.0],
      [-78.9, 33.7],
      [-79.9, 32.75],
      [-81.0, 32.0],
      [-81.4, 30.3],
      [-80.6, 28.4],
      [-80.1, 25.8],
      [-80.4, 25.2],
      [-81.1, 25.2],
      [-81.8, 26.15],
      [-82.8, 27.9],
      [-83.6, 29.9],
      [-84.3, 30.05],
      [-85.0, 29.7],
      [-85.7, 30.15],
      [-87.2, 30.35],
      [-88.05, 30.4],
      [-88.9, 30.4],
      [-89.6, 30.2],
      [-89.4, 29.2],
      [-90.1, 29.1],
      [-91.3, 29.3],
      [-92.5, 29.6],
      [-93.8, 29.7],
      [-94.8, 29.3],
      [-96.3, 28.5],
      [-97.3, 27.7],
      [-97.2, 26.05],
      [-97.6, 26.1],
      [-98.3, 26.3],
      [-99.5, 27.6],
      [-100.3, 28.4],
      [-100.5, 28.8],
      [-100.9, 29.45],
      [-101.4, 29.85],
      [-102.4, 29.9],
      [-103.1, 29.2],
      [-104.0, 29.6],
      [-104.7, 30.3],
      [-106.4, 31.85],
      [-108.3, 31.85],
      [-108.3, 31.42],
      [-111.07, 31.42],
      [-114.8, 32.6],
      [-114.7, 32.8],
      [-117.1, 32.62],
      [-117.25, 32.7],
      [-118.5, 34.0],
      [-120.5, 34.45],
      [-121.9, 36.6],
      [-122.5, 37.75],
      [-123.0, 38.0],
      [-123.8, 39.5],
      [-124.4, 40.4],
      [-124.2, 41.8],
      [-124.5, 42.8],
      [-124.1, 44.0],
      [-124.0, 46.2],
      [-124.1, 47.0],
      [-124.7, 48.38]
    ])
  }
]

export default {
  name: '002-seed-maps',

  async up(): Promise<void> {
    if (await DB.table('maps').where('name', MAPS[0].name).first()) {
      return
    }

    await DB.transaction(async () => {
      await DB.table('places').insert(
        PLACES.map((place) => ({
          name: place.name,
          countryCode: place.countryCode,
          geometry: JSON.stringify(place.geometry),
          enabled: true
        }))
      )

      // Read through the ORM-independent raw rows: ids by name + country (names are unique per country).
      const rows = await DB.table('places').get()
      const placeIds = new Map(rows.map((row) => [`${row.name}|${row.countryCode ?? row.countrycode}`, row.id]))

      for (const map of MAPS) {
        await DB.table('maps').insert({
          name: map.name,
          description: map.description,
          image: map.image,
          settings: map.settings ? JSON.stringify(map.settings) : null,
          enabled: true
        })

        const mapRow = await DB.table('maps').where('name', map.name).first()

        await DB.table('map_places').insert(
          PLACES.filter(map.places).map((place) => ({
            mapId: mapRow!.id,
            placeId: placeIds.get(`${place.name}|${place.countryCode}`)
          }))
        )
      }
    })
  }
}
