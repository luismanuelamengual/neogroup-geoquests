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
 *   - "Argentina", "España" and "Estados Unidos": the capital cities of the
 *     provinces / states of each country (24 provinces of Argentina, the 47
 *     peninsular provinces of Spain, the capitals of the 48 continental states
 *     of the United States). A whole-country polygon was not used because the
 *     random points often fell on roads and rural areas, impossible to tell
 *     apart. Capitals that are already cities of another map (Mendoza,
 *     Córdoba, Madrid...) are the same place, linked to both maps.
 *   - "Latinoamérica": the cities of "Ciudades del mundo" located in Latin
 *     America plus many more of its cities (Ecuador, Bolivia, Paraguay, Central
 *     America, the Caribbean...).
 *   - "Europa": the cities of "Ciudades del mundo" located in Europe plus many
 *     more of its cities (Balkans, Baltics, Eastern Europe...).
 *   - "Lugares icónicos": hundreds of monuments, natural wonders and famous
 *     sights all over the world (small circles around each one). There are
 *     that many on purpose, so games do not repeat them and they cannot be
 *     learnt by heart.
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
  /**
   * Only part of this map (a whole country, the landmarks...), not of
   * "Ciudades del mundo". Also the regional maps ("Latinoamérica", "Europa")
   * take the places of their countries that have no `onlyMap`.
   */
  onlyMap?: string
  /** Also part of these maps (e.g. the country maps, whose capitals can be cities of other maps). */
  alsoIn?: string[]
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
   * modes.
   */
  settings: MapSettings | null
}

/** Countries whose cities (the ones of "Ciudades del mundo") are part of "Latinoamérica". */
const LATIN_AMERICA = new Set(['AR', 'CL', 'UY', 'BR', 'MX', 'CO', 'PE'])
/** Countries whose cities (the ones of "Ciudades del mundo") are part of "Europa". */
const EUROPE = new Set([
  'GB',
  'IE',
  'FR',
  'ES',
  'PT',
  'IT',
  'DE',
  'NL',
  'BE',
  'CH',
  'AT',
  'CZ',
  'HU',
  'PL',
  'SE',
  'NO',
  'DK',
  'FI',
  'IS',
  'GR',
  'TR'
])
const LATIN_AMERICA_MAP = 'Latinoamérica'
const EUROPE_MAP = 'Europa'
const LANDMARKS_MAP = 'Lugares icónicos'
/**
 * `scoreMaxDistanceKm` of the maps (distance from which a guess scores 0),
 * proportional to the area each map covers: tens of km would be too strict for
 * a country, thousands too permissive. World-wide maps use about the same
 * maximum distance as GeoGuessr's world map (~15000 km, the antipodes being
 * 20000 km away).
 */
const WORLD_SCORE_MAX_DISTANCE_KM = 10000
const LATIN_AMERICA_SCORE_MAX_DISTANCE_KM = 6000 // Tijuana - Ushuaia: ~9000 km
const UNITED_STATES_SCORE_MAX_DISTANCE_KM = 3000 // Coast to coast: ~4500 km
const EUROPE_SCORE_MAX_DISTANCE_KM = 3000 // Reikiavik - Athens: ~3700 km
const ARGENTINA_SCORE_MAX_DISTANCE_KM = 2200 // La Quiaca - Río Gallegos: ~3500 km
const SPAIN_SCORE_MAX_DISTANCE_KM = 800 // Galicia - Almería: ~850 km

const ARGENTINA_MAP = 'Argentina'
const SPAIN_MAP = 'España'
const UNITED_STATES_MAP = 'Estados Unidos'

/** A map of a country: its places are the capitals of its provinces / states. */
function countryMap(name: string, description: string, scoreMaxDistanceKm: number): SeedMap {
  return {
    name,
    description,
    image: null,
    places: (place) => place.onlyMap === name || !!place.alsoIn?.includes(name),
    settings: { scoreMaxDistanceKm }
  }
}

const MAPS: SeedMap[] = [
  {
    name: 'Ciudades famosas',
    description:
      'Aparecés en una calle de una de las 20 ciudades más conocidas del mundo. ¿Sabés cuál es y dónde estás?',
    image: null,
    places: (place) => !!place.famous,
    settings: { scoreMaxDistanceKm: WORLD_SCORE_MAX_DISTANCE_KM }
  },
  {
    name: 'Ciudades del mundo',
    description:
      '150 ciudades de 36 países: capitales, pero también ciudades medianas y chicas. ¿Te animás a reconocerlas?',
    image: null,
    places: (place) => !place.onlyMap,
    settings: { scoreMaxDistanceKm: WORLD_SCORE_MAX_DISTANCE_KM }
  },
  {
    name: LANDMARKS_MAP,
    description:
      'Aparecés junto a un monumento, una maravilla natural o un sitio famoso: del Coliseo a Machu Picchu, de la Torre Eiffel a Uluru. Más de 500 lugares en todo el mundo.',
    image: null,
    places: (place) => place.onlyMap === LANDMARKS_MAP,
    settings: { scoreMaxDistanceKm: WORLD_SCORE_MAX_DISTANCE_KM }
  },
  countryMap(
    ARGENTINA_MAP,
    'Aparecés en la capital de una de las 24 provincias argentinas, de Jujuy a Tierra del Fuego. ¿Sabés cuál es?',
    ARGENTINA_SCORE_MAX_DISTANCE_KM
  ),
  countryMap(
    SPAIN_MAP,
    'Aparecés en la capital de una de las 47 provincias de la España peninsular, de A Coruña a Almería. ¿Sabés cuál es?',
    SPAIN_SCORE_MAX_DISTANCE_KM
  ),
  countryMap(
    UNITED_STATES_MAP,
    'Aparecés en la capital de uno de los 48 estados continentales de Estados Unidos, de Olympia a Tallahassee. ¿Sabés cuál es?',
    UNITED_STATES_SCORE_MAX_DISTANCE_KM
  ),
  {
    name: LATIN_AMERICA_MAP,
    description:
      'De México a Ushuaia: más de 100 ciudades latinoamericanas, desde las grandes capitales hasta pueblos chicos. ¿Reconocés dónde estás?',
    image: null,
    places: (place) => place.onlyMap === LATIN_AMERICA_MAP || (!place.onlyMap && LATIN_AMERICA.has(place.countryCode)),
    settings: { scoreMaxDistanceKm: LATIN_AMERICA_SCORE_MAX_DISTANCE_KM }
  },
  {
    name: EUROPE_MAP,
    description:
      'Más de 200 ciudades europeas, de Reikiavik a Atenas y de Lisboa a Moscú: capitales, pero también ciudades medianas y chicas. ¿Te animás?',
    image: null,
    places: (place) => place.onlyMap === EUROPE_MAP || (!place.onlyMap && EUROPE.has(place.countryCode)),
    settings: { scoreMaxDistanceKm: EUROPE_SCORE_MAX_DISTANCE_KM }
  }
]

/** Circle geometry: GeoJSON Point [longitude, latitude] + radius in meters. */
function circle(latitude: number, longitude: number, radius: number): SeedPlace['geometry'] {
  return { type: 'Point', coordinates: [longitude, latitude], radius }
}

/** Polygon geometry from its outer ring of [longitude, latitude] positions (first = last). */
function polygon(ring: number[][]): SeedPlace['geometry'] {
  return { type: 'Polygon', coordinates: [ring] }
}

const BASE_PLACES: SeedPlace[] = [
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
  { name: 'Pretoria', countryCode: 'ZA', geometry: circle(-25.7479, 28.2293, 6000) }
]

/** Compact form of a place drawn as a circle: name, country, latitude, longitude, radius (meters). */
type PlaceRow = [name: string, countryCode: string, latitude: number, longitude: number, radius: number]

function circlesOf(rows: PlaceRow[], onlyMap: string): SeedPlace[] {
  return rows.map(([name, countryCode, latitude, longitude, radius]) => ({
    name,
    countryCode,
    onlyMap,
    geometry: circle(latitude, longitude, radius)
  }))
}

/**
 * More cities of Latin America, only in "Latinoamérica" (not in "Ciudades del
 * mundo"): countries and towns that the world map leaves out.
 */
const LATIN_AMERICA_CITIES: PlaceRow[] = [
  // Argentina
  ['Ushuaia', 'AR', -54.8019, -68.303, 3000],
  ['San Miguel de Tucumán', 'AR', -26.8083, -65.2176, 5000],
  ['Neuquén', 'AR', -38.9516, -68.0591, 4000],
  ['Puerto Madryn', 'AR', -42.7692, -65.0385, 3000],
  ['Posadas', 'AR', -27.3671, -55.8961, 4000],
  ['El Calafate', 'AR', -50.3379, -72.2648, 2500],
  ['San Salvador de Jujuy', 'AR', -24.1858, -65.2995, 3000],
  ['Santa Fe', 'AR', -31.6333, -60.7, 4000],
  ['San Juan', 'AR', -31.5375, -68.5364, 4000],
  ['Resistencia', 'AR', -27.4606, -58.9839, 4000],
  // Chile
  ['Punta Arenas', 'CL', -53.1638, -70.9171, 3500],
  ['Arica', 'CL', -18.4783, -70.3126, 3500],
  ['Iquique', 'CL', -20.2133, -70.1503, 3500],
  ['Antofagasta', 'CL', -23.6509, -70.3975, 4000],
  ['Puerto Montt', 'CL', -41.4693, -72.9424, 3500],
  ['Valdivia', 'CL', -39.8142, -73.2459, 3000],
  // Uruguay
  ['Salto', 'UY', -31.3833, -57.9667, 3000],
  ['Paysandú', 'UY', -32.3214, -58.0756, 3000],
  // Brasil
  ['Brasilia', 'BR', -15.7939, -47.8828, 6000],
  ['Recife', 'BR', -8.0476, -34.877, 6000],
  ['Fortaleza', 'BR', -3.7319, -38.5267, 6000],
  ['Manaos', 'BR', -3.119, -60.0217, 5000],
  ['Belém', 'BR', -1.4558, -48.5044, 5000],
  ['Natal', 'BR', -5.7945, -35.211, 4000],
  ['São Luís', 'BR', -2.5307, -44.3068, 4000],
  ['Campo Grande', 'BR', -20.4697, -54.6201, 4500],
  // México
  ['Tijuana', 'MX', 32.5149, -117.0382, 6000],
  ['Cancún', 'MX', 21.1619, -86.8515, 5000],
  ['Querétaro', 'MX', 20.5888, -100.3899, 5000],
  ['León', 'MX', 21.125, -101.686, 5000],
  ['San Luis Potosí', 'MX', 22.1565, -100.9855, 5000],
  ['Veracruz', 'MX', 19.1738, -96.1342, 4000],
  ['Chihuahua', 'MX', 28.633, -106.0691, 5000],
  ['Morelia', 'MX', 19.706, -101.195, 4000],
  ['Acapulco', 'MX', 16.8531, -99.8237, 5000],
  ['La Paz (Baja California Sur)', 'MX', 24.1426, -110.3128, 3500],
  ['San Miguel de Allende', 'MX', 20.9144, -100.7452, 2500],
  ['Guanajuato', 'MX', 21.019, -101.2574, 2500],
  // Colombia
  ['Barranquilla', 'CO', 10.9685, -74.7813, 5000],
  ['Bucaramanga', 'CO', 7.1193, -73.1227, 4000],
  ['Pereira', 'CO', 4.8133, -75.6961, 4000],
  ['Santa Marta', 'CO', 11.2408, -74.199, 3500],
  ['Manizales', 'CO', 5.0703, -75.5138, 3000],
  // Perú
  ['Iquitos', 'PE', -3.7437, -73.2516, 3500],
  ['Piura', 'PE', -5.1945, -80.6328, 3500],
  ['Chiclayo', 'PE', -6.7714, -79.8409, 3500],
  ['Puno', 'PE', -15.8402, -70.0219, 3000],
  ['Huaraz', 'PE', -9.5277, -77.5278, 2500],
  ['Cajamarca', 'PE', -7.1638, -78.5003, 3000],
  // Ecuador
  ['Quito', 'EC', -0.1807, -78.4678, 7000],
  ['Guayaquil', 'EC', -2.171, -79.9224, 6000],
  ['Cuenca', 'EC', -2.9001, -79.0059, 4000],
  ['Ambato', 'EC', -1.2417, -78.6197, 3500],
  // Bolivia
  ['La Paz', 'BO', -16.4897, -68.1193, 6000],
  ['Santa Cruz de la Sierra', 'BO', -17.7833, -63.1821, 6000],
  ['Cochabamba', 'BO', -17.3895, -66.1568, 5000],
  ['Sucre', 'BO', -19.0196, -65.2619, 3000],
  // Paraguay
  ['Asunción', 'PY', -25.2637, -57.5759, 6000],
  ['Ciudad del Este', 'PY', -25.5097, -54.6111, 4000],
  // Centroamérica y el Caribe
  ['San José', 'CR', 9.9281, -84.0907, 4000],
  ['Alajuela', 'CR', 10.0162, -84.2141, 3500],
  ['Cartago', 'CR', 9.8644, -83.9194, 2500],
  ['Ciudad de Panamá', 'PA', 8.9824, -79.5199, 6000],
  ['Ciudad de Guatemala', 'GT', 14.6349, -90.5069, 6000],
  ['Antigua Guatemala', 'GT', 14.5586, -90.7295, 2000],
  ['Quetzaltenango', 'GT', 14.8347, -91.518, 3000],
  ['Santo Domingo', 'DO', 18.4861, -69.9312, 6000],
  ['Santiago de los Caballeros', 'DO', 19.4517, -70.697, 4000],
  ['San Juan', 'PR', 18.4655, -66.1057, 5000]
]
/** More cities of Europe, only in "Europa" (not in "Ciudades del mundo"). */
const EUROPE_CITIES: PlaceRow[] = [
  // Reino Unido e Irlanda
  ['Birmingham', 'GB', 52.4862, -1.8904, 6000],
  ['Leeds', 'GB', 53.8008, -1.5491, 5000],
  ['Sheffield', 'GB', 53.3811, -1.4701, 4500],
  ['Newcastle', 'GB', 54.9783, -1.6178, 4500],
  ['Cardiff', 'GB', 51.4816, -3.1791, 4500],
  ['Belfast', 'GB', 54.5973, -5.9301, 4500],
  ['Nottingham', 'GB', 52.9548, -1.1581, 4000],
  ['Oxford', 'GB', 51.752, -1.2577, 3000],
  ['Cambridge', 'GB', 52.2053, 0.1218, 3000],
  ['Brighton', 'GB', 50.8225, -0.1372, 3500],
  ['York', 'GB', 53.96, -1.0873, 2500],
  ['Aberdeen', 'GB', 57.1497, -2.0943, 3500],
  ['Limerick', 'IE', 52.6638, -8.6267, 3500],
  ['Kilkenny', 'IE', 52.6541, -7.2448, 2500],
  ['Waterford', 'IE', 52.2593, -7.1101, 3000],
  // Francia
  ['Lille', 'FR', 50.6292, 3.0573, 4000],
  ['Nantes', 'FR', 47.2184, -1.5536, 4500],
  ['Montpellier', 'FR', 43.6108, 3.8767, 4000],
  ['Rennes', 'FR', 48.1173, -1.6778, 4000],
  ['Ruan', 'FR', 49.4432, 1.0993, 3000],
  ['Dijon', 'FR', 47.322, 5.0415, 3000],
  ['Reims', 'FR', 49.2583, 4.0317, 3000],
  ['Aviñón', 'FR', 43.9493, 4.8055, 2500],
  ['Ajaccio', 'FR', 41.9192, 8.7386, 3000],
  // España
  ['Zaragoza', 'ES', 41.6488, -0.8891, 5000],
  ['Palma de Mallorca', 'ES', 39.5696, 2.6502, 4000],
  ['San Sebastián', 'ES', 43.3183, -1.9812, 3000],
  ['Santander', 'ES', 43.4623, -3.8099, 3500],
  ['Salamanca', 'ES', 40.9701, -5.6635, 3000],
  ['Las Palmas de Gran Canaria', 'ES', 28.1235, -15.4363, 4500],
  ['Vigo', 'ES', 42.2406, -8.7207, 4000],
  ['Pamplona', 'ES', 42.8125, -1.6458, 3000],
  ['Toledo', 'ES', 39.8628, -4.0273, 2500],
  ['Córdoba', 'ES', 37.8882, -4.7794, 3500],
  ['Alicante', 'ES', 38.3452, -0.481, 4000],
  ['Oviedo', 'ES', 43.3614, -5.8494, 3000],
  // Portugal
  ['Braga', 'PT', 41.5454, -8.4265, 3000],
  ['Funchal', 'PT', 32.6669, -16.9241, 3500],
  ['Ponta Delgada', 'PT', 37.7412, -25.6756, 2500],
  ['Évora', 'PT', 38.5714, -7.9135, 2000],
  // Italia
  ['Venecia', 'IT', 45.4408, 12.3155, 3000],
  ['Génova', 'IT', 44.4056, 8.9463, 4000],
  ['Verona', 'IT', 45.4384, 10.9916, 3500],
  ['Padua', 'IT', 45.4064, 11.8768, 3500],
  ['Trieste', 'IT', 45.6495, 13.7768, 3500],
  ['Pisa', 'IT', 43.7228, 10.4017, 3000],
  ['Siena', 'IT', 43.3188, 11.3308, 2000],
  ['Perugia', 'IT', 43.1107, 12.3908, 3000],
  ['Bari', 'IT', 41.1171, 16.8719, 4000],
  ['Catania', 'IT', 37.5079, 15.083, 4000],
  ['Cagliari', 'IT', 39.2238, 9.1217, 3500],
  // Alemania
  ['Stuttgart', 'DE', 48.7758, 9.1829, 5000],
  ['Düsseldorf', 'DE', 51.2277, 6.7735, 5000],
  ['Dortmund', 'DE', 51.5136, 7.4653, 5000],
  ['Leipzig', 'DE', 51.3397, 12.3731, 5000],
  ['Dresde', 'DE', 51.0504, 13.7373, 5000],
  ['Núremberg', 'DE', 49.4521, 11.0767, 4500],
  ['Hannover', 'DE', 52.3759, 9.732, 5000],
  ['Bremen', 'DE', 53.0793, 8.8017, 4500],
  ['Friburgo de Brisgovia', 'DE', 47.999, 7.8421, 3500],
  ['Heidelberg', 'DE', 49.3988, 8.6724, 3000],
  // Países Bajos, Bélgica, Luxemburgo
  ['Groninga', 'NL', 53.2194, 6.5665, 3500],
  ['Eindhoven', 'NL', 51.4416, 5.4697, 4000],
  ['Maastricht', 'NL', 50.8514, 5.691, 3000],
  ['Haarlem', 'NL', 52.3874, 4.6462, 3000],
  ['Lieja', 'BE', 50.6326, 5.5797, 4000],
  ['Lovaina', 'BE', 50.8798, 4.7005, 3000],
  ['Namur', 'BE', 50.4674, 4.8719, 2500],
  ['Charleroi', 'BE', 50.4108, 4.4446, 3500],
  ['Luxemburgo', 'LU', 49.6116, 6.1319, 4000],
  // Suiza y Austria
  ['Basilea', 'CH', 47.5596, 7.5886, 4000],
  ['Lausana', 'CH', 46.5197, 6.6323, 3500],
  ['Lucerna', 'CH', 47.0502, 8.3093, 3000],
  ['Lugano', 'CH', 46.0037, 8.9511, 3000],
  ['San Galo', 'CH', 47.4245, 9.3767, 3000],
  ['Graz', 'AT', 47.0707, 15.4395, 4000],
  ['Linz', 'AT', 48.3069, 14.2858, 4000],
  ['Klagenfurt', 'AT', 46.6247, 14.3053, 3000],
  // Europa central
  ['Ostrava', 'CZ', 49.8209, 18.2625, 4500],
  ['Pilsen', 'CZ', 49.7384, 13.3736, 3500],
  ['Olomouc', 'CZ', 49.5938, 17.2509, 3000],
  ['Debrecen', 'HU', 47.5316, 21.6273, 4000],
  ['Szeged', 'HU', 46.253, 20.1414, 3500],
  ['Pécs', 'HU', 46.0727, 18.2323, 3000],
  ['Győr', 'HU', 47.6875, 17.6504, 3000],
  ['Poznań', 'PL', 52.4064, 16.9252, 5000],
  ['Lodz', 'PL', 51.7592, 19.456, 5000],
  ['Lublin', 'PL', 51.2465, 22.5684, 4000],
  ['Katowice', 'PL', 50.2649, 19.0238, 4500],
  ['Szczecin', 'PL', 53.4285, 14.5528, 4000],
  ['Toruń', 'PL', 53.0138, 18.5984, 3000],
  ['Bratislava', 'SK', 48.1486, 17.1077, 5000],
  ['Košice', 'SK', 48.7164, 21.2611, 3500],
  ['Liubliana', 'SI', 46.0569, 14.5058, 4000],
  ['Maribor', 'SI', 46.5547, 15.6459, 3000],
  // Balcanes
  ['Zagreb', 'HR', 45.815, 15.9819, 6000],
  ['Split', 'HR', 43.5081, 16.4402, 3500],
  ['Dubrovnik', 'HR', 42.6507, 18.0944, 2500],
  ['Rijeka', 'HR', 45.3271, 14.4422, 3500],
  ['Belgrado', 'RS', 44.7866, 20.4489, 6000],
  ['Novi Sad', 'RS', 45.2671, 19.8335, 3500],
  ['Sarajevo', 'BA', 43.8563, 18.4131, 4000],
  ['Podgorica', 'ME', 42.4304, 19.2594, 3500],
  ['Skopie', 'MK', 41.9981, 21.4254, 4000],
  ['Tirana', 'AL', 41.3275, 19.8187, 4000],
  ['Bucarest', 'RO', 44.4268, 26.1025, 7000],
  ['Cluj-Napoca', 'RO', 46.7712, 23.6236, 4000],
  ['Brașov', 'RO', 45.6427, 25.5887, 3500],
  ['Timișoara', 'RO', 45.7489, 21.2087, 4000],
  ['Iași', 'RO', 47.1585, 27.6014, 4000],
  ['Sofía', 'BG', 42.6977, 23.3219, 6000],
  ['Plovdiv', 'BG', 42.1354, 24.7453, 3500],
  ['Varna', 'BG', 43.2141, 27.9147, 4000],
  // Grecia, Chipre y Malta
  ['Heraclión', 'GR', 35.3387, 25.1442, 3500],
  ['Patras', 'GR', 38.2466, 21.7346, 3500],
  ['Corfú', 'GR', 39.6243, 19.9217, 2500],
  ['Rodas', 'GR', 36.4349, 28.2176, 2500],
  ['Nicosia', 'CY', 35.1856, 33.3823, 4000],
  ['Limasol', 'CY', 34.6841, 33.0379, 3500],
  ['La Valeta (ciudad)', 'MT', 35.8989, 14.5146, 3000],
  // Países bálticos
  ['Tallin', 'EE', 59.437, 24.7536, 4000],
  ['Tartu', 'EE', 58.378, 26.729, 3000],
  ['Riga', 'LV', 56.9496, 24.1052, 5000],
  ['Vilna', 'LT', 54.6872, 25.2797, 5000],
  ['Kaunas', 'LT', 54.8985, 23.9036, 4000],
  // Países nórdicos
  ['Turku', 'FI', 60.4518, 22.2666, 3500],
  ['Oulu', 'FI', 65.0121, 25.4651, 3500],
  ['Rovaniemi', 'FI', 66.5039, 25.7294, 2500],
  ['Upsala', 'SE', 59.8586, 17.6389, 3500],
  ['Linköping', 'SE', 58.4108, 15.6214, 3500],
  ['Umeå', 'SE', 63.8258, 20.263, 3500],
  ['Trondheim', 'NO', 63.4305, 10.3951, 4000],
  ['Stavanger', 'NO', 58.97, 5.7331, 3500],
  ['Tromsø', 'NO', 69.6492, 18.9553, 3000],
  ['Odense', 'DK', 55.4038, 10.4024, 3500],
  ['Aalborg', 'DK', 57.0488, 9.9217, 3500],
  ['Akureyri', 'IS', 65.6885, -18.1262, 2500],
  ['Tórshavn', 'FO', 62.0079, -6.777, 2000],
  // Rusia europea
  ['Moscú', 'RU', 55.7558, 37.6173, 9000],
  ['San Petersburgo', 'RU', 59.9343, 30.3351, 8000]
]
/**
 * Landmarks: monuments, natural wonders and famous sights. A circle of a few
 * hundred meters around each one (up to a couple of kilometers for the big
 * natural areas, where the Street View roads are spread out). Only in "Lugares
 * icónicos". There are hundreds on purpose: each game draws only a few, so they
 * rarely repeat and cannot be learnt by heart.
 */
const LANDMARKS: PlaceRow[] = [
  // Francia
  ['Torre Eiffel', 'FR', 48.8584, 2.2945, 500],
  ['Museo del Louvre', 'FR', 48.8606, 2.3376, 400],
  ['Arco del Triunfo', 'FR', 48.8738, 2.295, 400],
  ['Catedral de Notre-Dame', 'FR', 48.853, 2.3499, 350],
  ['Basílica del Sacré-Cœur', 'FR', 48.8867, 2.3431, 350],
  ['Ópera Garnier', 'FR', 48.872, 2.3316, 250],
  ['Moulin Rouge', 'FR', 48.8841, 2.3323, 200],
  ['Palacio de Versalles', 'FR', 48.8049, 2.1204, 700],
  ['Mont-Saint-Michel', 'FR', 48.6361, -1.5115, 500],
  ['Castillo de Chambord', 'FR', 47.6161, 1.517, 600],
  ['Castillo de Chenonceau', 'FR', 47.3249, 1.07, 400],
  ['Acantilados de Étretat', 'FR', 49.7074, 0.1961, 500],
  ['Ciudad medieval de Carcasona', 'FR', 43.2061, 2.3635, 400],
  ['Puente del Gard', 'FR', 43.9475, 4.5352, 500],
  ['Gargantas del Verdon', 'FR', 43.77, 6.35, 1500],
  ['Duna del Pilat', 'FR', 44.589, -1.214, 500],
  ['Paseo de los Ingleses (Niza)', 'FR', 43.695, 7.265, 500],
  ['Puerto Viejo de Marsella', 'FR', 43.2951, 5.3742, 250],
  ['Catedral de Reims', 'FR', 49.2535, 4.0337, 300],
  ['Plaza Stanislas (Nancy)', 'FR', 48.6936, 6.1833, 250],
  ['Campos de lavanda de Valensole', 'FR', 43.839, 6.093, 1200],
  ['Chamonix y el Mont Blanc', 'FR', 45.9237, 6.8694, 800],
  ['Palacio de los Papas (Aviñón)', 'FR', 43.9507, 4.8075, 300],
  ['Pequeña Venecia de Colmar', 'FR', 48.0769, 7.3553, 300],
  ['Catedral de Estrasburgo', 'FR', 48.5818, 7.7509, 250],
  // Italia y microestados
  ['Coliseo de Roma', 'IT', 41.8902, 12.4922, 400],
  ['Foro Romano', 'IT', 41.8925, 12.4853, 350],
  ['Fontana de Trevi', 'IT', 41.9009, 12.4833, 250],
  ['Panteón de Agripa', 'IT', 41.8986, 12.4769, 250],
  ['Plaza Navona', 'IT', 41.8992, 12.4731, 200],
  ["Castel Sant'Angelo", 'IT', 41.9031, 12.4663, 250],
  ['Plaza de San Pedro', 'VA', 41.9022, 12.4539, 350],
  ['Torre de Pisa', 'IT', 43.723, 10.3966, 350],
  ['Duomo de Florencia', 'IT', 43.7731, 11.256, 300],
  ['Ponte Vecchio', 'IT', 43.768, 11.2531, 250],
  ['Plaza de San Marcos (Venecia)', 'IT', 45.4343, 12.3388, 300],
  ['Puente de Rialto', 'IT', 45.438, 12.3359, 250],
  ['Duomo de Milán', 'IT', 45.4642, 9.1916, 300],
  ['Mole Antonelliana', 'IT', 45.0692, 7.6934, 250],
  ['Las Dos Torres de Bolonia', 'IT', 44.494, 11.3468, 250],
  ['Plaza del Campo (Siena)', 'IT', 43.3184, 11.331, 300],
  ['Arena de Verona', 'IT', 45.439, 10.9943, 250],
  ['Pompeya', 'IT', 40.7462, 14.4989, 600],
  ['Costa Amalfitana (Positano)', 'IT', 40.6281, 14.485, 600],
  ['Isla de Capri', 'IT', 40.5509, 14.2426, 600],
  ['Cinque Terre (Manarola)', 'IT', 44.1077, 9.7297, 600],
  ['Tre Cime di Lavaredo', 'IT', 46.612, 12.295, 1000],
  ['Lago di Braies', 'IT', 46.6942, 12.0856, 600],
  ['Lago de Como (Bellagio)', 'IT', 45.987, 9.2617, 600],
  ['Sirmione (Lago de Garda)', 'IT', 45.491, 10.608, 400],
  ['Sassi de Matera', 'IT', 40.667, 16.611, 500],
  ['Trulli de Alberobello', 'IT', 40.784, 17.237, 400],
  ['Valle de los Templos (Agrigento)', 'IT', 37.2908, 13.5889, 600],
  ['Teatro Griego de Taormina', 'IT', 37.8524, 15.2925, 350],
  ['Monte Etna', 'IT', 37.751, 14.9934, 1200],
  ['Monte Titano', 'SM', 43.9424, 12.4578, 300],
  ['Casino de Montecarlo', 'MC', 43.7394, 7.4276, 350],
  // España
  ['Sagrada Familia', 'ES', 41.4036, 2.1744, 350],
  ['Casa Batlló', 'ES', 41.3917, 2.1649, 200],
  ['Parque Güell', 'ES', 41.4145, 2.1527, 400],
  ['La Alhambra', 'ES', 37.1761, -3.5881, 500],
  ['Mezquita de Córdoba', 'ES', 37.8789, -4.7794, 300],
  ['Giralda y Catedral de Sevilla', 'ES', 37.386, -5.9926, 250],
  ['Plaza de España (Sevilla)', 'ES', 37.3772, -5.9869, 350],
  ['Torre del Oro', 'ES', 37.3825, -5.9961, 200],
  ['Palacio Real de Madrid', 'ES', 40.4179, -3.7143, 400],
  ['Puerta de Alcalá', 'ES', 40.42, -3.6888, 300],
  ['Monasterio de El Escorial', 'ES', 40.5892, -4.1478, 400],
  ['Museo Guggenheim de Bilbao', 'ES', 43.2687, -2.934, 350],
  ['Catedral de Santiago de Compostela', 'ES', 42.8806, -8.5446, 300],
  ['Acueducto de Segovia', 'ES', 40.948, -4.1175, 300],
  ['Alcázar de Segovia', 'ES', 40.9523, -4.1312, 300],
  ['Muralla de Ávila', 'ES', 40.6567, -4.699, 300],
  ['Catedral de Toledo', 'ES', 39.8575, -4.0246, 300],
  ['Casas Colgadas de Cuenca', 'ES', 40.0789, -2.1296, 250],
  ['Plaza Mayor de Salamanca', 'ES', 40.965, -5.664, 250],
  ['Catedral de Burgos', 'ES', 42.3407, -3.7044, 250],
  ['Teatro Romano de Mérida', 'ES', 38.9156, -6.3387, 300],
  ['Ciudad de las Artes y las Ciencias', 'ES', 39.4542, -0.3512, 500],
  ['Peñíscola', 'ES', 40.3586, 0.4081, 300],
  ['Dalt Vila (Ibiza)', 'ES', 38.9063, 1.4372, 350],
  ['Cabo de Formentor', 'ES', 39.96, 3.211, 700],
  ['Cadaqués', 'ES', 42.2888, 3.277, 400],
  ['Parque Nacional del Teide', 'ES', 28.2723, -16.6425, 1500],
  ['Playa de La Concha (San Sebastián)', 'ES', 43.3172, -1.987, 500],
  ['Puente Nuevo de Ronda', 'ES', 36.7416, -5.167, 300],
  ['Playa de las Catedrales', 'ES', 43.5527, -7.1578, 500],
  ['Santuario de Covadonga', 'ES', 43.3096, -5.0553, 400],
  ['Lagos de Covadonga', 'ES', 43.2711, -4.9846, 800],
  // Portugal
  ['Torre de Belém', 'PT', 38.6916, -9.216, 400],
  ['Monasterio de los Jerónimos', 'PT', 38.6979, -9.2068, 300],
  ['Palacio da Pena (Sintra)', 'PT', 38.7876, -9.3904, 500],
  ['Cabo da Roca', 'PT', 38.7804, -9.4989, 500],
  ['Elevador de Santa Justa', 'PT', 38.712, -9.1394, 200],
  ['Ribeira de Oporto', 'PT', 41.1406, -8.6136, 300],
  ['Universidad de Coímbra', 'PT', 40.2075, -8.426, 300],
  ['Valle del Duero (Pinhão)', 'PT', 41.189, -7.545, 800],
  ['Cueva de Benagil', 'PT', 37.087, -8.424, 500],
  ['Cabo Girão (Madeira)', 'PT', 32.655, -16.955, 400],
  ['Sete Cidades (Azores)', 'PT', 37.856, -25.791, 800],
  ['Monasterio de Batalha', 'PT', 39.6596, -8.8254, 300],
  ['Convento de Cristo (Tomar)', 'PT', 39.61, -8.417, 300],
  // Alemania
  ['Puerta de Brandeburgo', 'DE', 52.5163, 13.3777, 350],
  ['Reichstag', 'DE', 52.5186, 13.3762, 300],
  ['East Side Gallery', 'DE', 52.505, 13.4397, 400],
  ['Isla de los Museos', 'DE', 52.5169, 13.4019, 350],
  ['Castillo de Neuschwanstein', 'DE', 47.5576, 10.7498, 700],
  ['Catedral de Colonia', 'DE', 50.9413, 6.9583, 300],
  ['Marienplatz (Múnich)', 'DE', 48.1374, 11.5755, 300],
  ['Castillo de Heidelberg', 'DE', 49.4106, 8.7153, 400],
  ['Roca de Lorelei', 'DE', 50.1399, 7.7283, 500],
  ['Frauenkirche (Dresde)', 'DE', 51.0519, 13.7415, 300],
  ['Castillo de Wartburg', 'DE', 50.9667, 10.3064, 400],
  ['Elbphilharmonie (Hamburgo)', 'DE', 53.5413, 9.9841, 300],
  ['Catedral de Aquisgrán', 'DE', 50.7753, 6.0839, 250],
  ['Titisee (Selva Negra)', 'DE', 47.9, 8.15, 1500],
  ['Garmisch-Partenkirchen', 'DE', 47.492, 11.095, 800],
  ['Castillo de Hohenzollern', 'DE', 48.3233, 8.9678, 400],
  ['Holstentor (Lübeck)', 'DE', 53.866, 10.68, 250],
  ['Porta Nigra (Tréveris)', 'DE', 49.7597, 6.6441, 250],
  // Reino Unido e Irlanda
  ['Big Ben y el Parlamento', 'GB', 51.5007, -0.1246, 400],
  ['Puente de la Torre', 'GB', 51.5055, -0.0754, 400],
  ['Torre de Londres', 'GB', 51.5081, -0.0759, 350],
  ['Palacio de Buckingham', 'GB', 51.5014, -0.1419, 400],
  ['Ojo de Londres', 'GB', 51.5033, -0.1196, 300],
  ['Catedral de San Pablo', 'GB', 51.5138, -0.0984, 300],
  ['Trafalgar Square', 'GB', 51.508, -0.1281, 300],
  ['Abbey Road', 'GB', 51.532, -0.1773, 250],
  ['Stonehenge', 'GB', 51.1789, -1.8262, 600],
  ['Castillo de Windsor', 'GB', 51.4839, -0.6044, 450],
  ['Baños romanos de Bath', 'GB', 51.3813, -2.359, 300],
  ['Radcliffe Camera (Oxford)', 'GB', 51.7534, -1.254, 300],
  ["King's College (Cambridge)", 'GB', 52.2043, 0.1163, 300],
  ['Catedral de Canterbury', 'GB', 51.2798, 1.0829, 300],
  ['York Minster', 'GB', 53.9621, -1.0819, 300],
  ['Catedral de Durham', 'GB', 54.7734, -1.5756, 250],
  ['Blackpool Tower', 'GB', 53.8158, -3.055, 250],
  ['Castillo de Edimburgo', 'GB', 55.9486, -3.1999, 400],
  ['Puente ferroviario del Forth', 'GB', 55.99, -3.388, 500],
  ['Castillo de Urquhart (Lago Ness)', 'GB', 57.324, -4.442, 500],
  ['Viaducto de Glenfinnan', 'GB', 56.876, -5.431, 600],
  ['Old Man of Storr (Skye)', 'GB', 57.5068, -6.183, 800],
  ['Calzada del Gigante', 'GB', 55.2408, -6.5116, 600],
  ['Acantilados de Seven Sisters', 'GB', 50.744, 0.153, 800],
  ['Portmeirion', 'GB', 52.9145, -4.098, 400],
  ['Paso de Llanberis (Snowdonia)', 'GB', 53.093, -4.02, 1500],
  ['Acantilados de Moher', 'IE', 52.9715, -9.4265, 700],
  ['Trinity College (Dublín)', 'IE', 53.3438, -6.2546, 300],
  ['Guinness Storehouse', 'IE', 53.3419, -6.2867, 300],
  ['Roca de Cashel', 'IE', 52.52, -7.89, 300],
  ['Slea Head (Dingle)', 'IE', 52.11, -10.45, 1000],
  ['Newgrange', 'IE', 53.6947, -6.4755, 400],
  ['Abadía de Kylemore', 'IE', 53.561, -9.877, 400],
  ['Castillo de Blarney', 'IE', 51.929, -8.571, 300],
  // Países Bajos, Bélgica y Luxemburgo
  ['Casa de Ana Frank', 'NL', 52.3752, 4.884, 350],
  ['Rijksmuseum', 'NL', 52.36, 4.8852, 350],
  ['Molinos de Kinderdijk', 'NL', 51.883, 4.6339, 700],
  ['Zaanse Schans', 'NL', 52.475, 4.816, 500],
  ['Campos de tulipanes de Keukenhof', 'NL', 52.27, 4.546, 600],
  ['Palacio de la Paz (La Haya)', 'NL', 52.0866, 4.2965, 250],
  ['Atomium', 'BE', 50.8949, 4.3415, 350],
  ['Grand-Place de Bruselas', 'BE', 50.8467, 4.3525, 250],
  ['Plaza Markt de Brujas', 'BE', 51.2086, 3.2249, 300],
  ['Castillo de los Condes de Flandes (Gante)', 'BE', 51.0572, 3.7211, 250],
  ['Catedral de Amberes', 'BE', 51.2205, 4.401, 250],
  ['Ciudad vieja de Luxemburgo', 'LU', 49.6116, 6.1319, 300],
  // Europa central
  ['Capilla del Puente (Lucerna)', 'CH', 47.0516, 8.3075, 300],
  ['Zermatt y el Matterhorn', 'CH', 46.0207, 7.7491, 700],
  ['Castillo de Chillon', 'CH', 46.4143, 6.9274, 400],
  ["Jet d'Eau (Ginebra)", 'CH', 46.2074, 6.1557, 350],
  ['Valle de Lauterbrunnen', 'CH', 46.5936, 7.9075, 700],
  ['Cataratas del Rin', 'CH', 47.6779, 8.6152, 400],
  ['Castillo de Gruyères', 'CH', 46.5833, 7.0833, 350],
  ['Palacio de Schönbrunn', 'AT', 48.1845, 16.3122, 500],
  ['Catedral de San Esteban (Viena)', 'AT', 48.2086, 16.3731, 250],
  ['Ópera Estatal de Viena', 'AT', 48.2031, 16.369, 250],
  ['Palacio de Hofburg', 'AT', 48.2066, 16.3656, 300],
  ['Hallstatt', 'AT', 47.5622, 13.6493, 500],
  ['Fortaleza de Hohensalzburg', 'AT', 47.7947, 13.0477, 350],
  ['Carretera del Großglockner', 'AT', 47.075, 12.84, 1500],
  ['Castillo de Vaduz', 'LI', 47.1394, 9.5234, 300],
  ['Castillo de Praga', 'CZ', 50.0909, 14.4005, 450],
  ['Puente de Carlos', 'CZ', 50.0865, 14.4114, 300],
  ['Reloj Astronómico de Praga', 'CZ', 50.087, 14.4208, 250],
  ['Český Krumlov', 'CZ', 48.8107, 14.3159, 350],
  ['Osario de Sedlec', 'CZ', 49.9611, 15.2903, 250],
  ['Parlamento de Budapest', 'HU', 47.5072, 19.0458, 350],
  ['Bastión de los Pescadores', 'HU', 47.5022, 19.0347, 250],
  ['Plaza de los Héroes (Budapest)', 'HU', 47.5146, 19.0781, 250],
  ['Baños Széchenyi', 'HU', 47.5185, 19.0819, 250],
  ['Tihany (Lago Balatón)', 'HU', 46.914, 17.89, 500],
  ['Castillo de Wawel', 'PL', 50.054, 19.9352, 350],
  ['Plaza del Mercado de Cracovia', 'PL', 50.0617, 19.9373, 300],
  ['Minas de sal de Wieliczka', 'PL', 49.9833, 20.0544, 300],
  ['Castillo de Malbork', 'PL', 54.0396, 19.0284, 500],
  ['Palacio de la Cultura (Varsovia)', 'PL', 52.2319, 21.0067, 300],
  ['Castillo Real de Varsovia', 'PL', 52.2479, 21.0147, 250],
  ['Castillo de Bratislava', 'SK', 48.142, 17.1, 350],
  ['Lago Bled', 'SI', 46.3625, 14.0937, 700],
  ['Cueva de Postojna', 'SI', 45.7826, 14.2036, 500],
  ['Puente de los Dragones (Liubliana)', 'SI', 46.0523, 14.5117, 250],
  // Balcanes y Europa del este
  ['Murallas de Dubrovnik', 'HR', 42.641, 18.11, 500],
  ['Lagos de Plitvice', 'HR', 44.8654, 15.582, 900],
  ['Palacio de Diocleciano (Split)', 'HR', 43.5081, 16.4402, 350],
  ['Rovinj', 'HR', 45.0811, 13.6387, 350],
  ['Cascadas de Krka', 'HR', 43.803, 15.971, 700],
  ['Puente Viejo de Mostar', 'BA', 43.3376, 17.8152, 350],
  ['Baščaršija (Sarajevo)', 'BA', 43.8597, 18.4313, 250],
  ['Bahía de Kotor', 'ME', 42.4247, 18.7712, 450],
  ['Fortaleza de Kalemegdan', 'RS', 44.823, 20.45, 450],
  ['Templo de San Sava', 'RS', 44.7983, 20.4687, 250],
  ['Castillo de Bran', 'RO', 45.5152, 25.3672, 500],
  ['Palacio del Parlamento (Bucarest)', 'RO', 44.4275, 26.0875, 500],
  ['Castillo de Peleș', 'RO', 45.3597, 25.5424, 400],
  ['Sighișoara', 'RO', 46.219, 24.792, 350],
  ['Carretera Transfăgărășan', 'RO', 45.603, 24.617, 1500],
  ['Catedral Alejandro Nevski', 'BG', 42.6958, 23.3328, 350],
  ['Monasterio de Rila', 'BG', 42.1334, 23.34, 500],
  ['Casco antiguo de Tallin', 'EE', 59.437, 24.7454, 400],
  ['Casa de los Cabezas Negras (Riga)', 'LV', 56.9473, 24.1086, 350],
  ['Castillo de Trakai', 'LT', 54.6525, 24.9342, 500],
  ['Colina de las Cruces', 'LT', 56.015, 23.417, 400],
  ['Plaza Roja', 'RU', 55.7539, 37.6208, 400],
  ['Museo del Hermitage', 'RU', 59.9398, 30.3146, 400],
  ['Iglesia del Salvador sobre la Sangre', 'RU', 59.9401, 30.3287, 250],
  // Grecia y Turquía
  ['Acrópolis de Atenas', 'GR', 37.9715, 23.7257, 450],
  ['Oia (Santorini)', 'GR', 36.4618, 25.3753, 600],
  ['Meteora', 'GR', 39.7217, 21.6306, 800],
  ['Canal de Corinto', 'GR', 37.9333, 22.983, 400],
  ['Delfos', 'GR', 38.4824, 22.501, 500],
  ['Olimpia', 'GR', 37.6383, 21.63, 500],
  ['Mykonos (Pequeña Venecia)', 'GR', 37.4447, 25.327, 400],
  ['Ciudad medieval de Rodas', 'GR', 36.4431, 28.226, 400],
  ['Palacio de Cnosos', 'GR', 35.298, 25.163, 500],
  ['Templo de Poseidón (Sunión)', 'GR', 37.6503, 24.0247, 400],
  ['Santa Sofía', 'TR', 41.0086, 28.9802, 350],
  ['Mezquita Azul', 'TR', 41.0054, 28.9768, 300],
  ['Torre de Gálata', 'TR', 41.0256, 28.9744, 250],
  ['Palacio de Dolmabahçe', 'TR', 41.0392, 29.0004, 350],
  ['Puente del Bósforo', 'TR', 41.0451, 29.034, 400],
  ['Capadocia (Göreme)', 'TR', 38.6431, 34.8289, 900],
  ['Pamukkale', 'TR', 37.9203, 29.1187, 600],
  ['Éfeso', 'TR', 37.9397, 27.3417, 600],
  // Países nórdicos, islas y microestados
  ['Hallgrímskirkja', 'IS', 64.1417, -21.9266, 300],
  ['Gullfoss', 'IS', 64.3271, -20.1199, 700],
  ['Geysir', 'IS', 64.3104, -20.3024, 500],
  ['Laguna Azul', 'IS', 63.8804, -22.4495, 700],
  ['Skógafoss', 'IS', 63.5321, -19.5114, 600],
  ['Seljalandsfoss', 'IS', 63.6156, -19.9886, 500],
  ['Jökulsárlón', 'IS', 64.0484, -16.1794, 500],
  ['Þingvellir', 'IS', 64.2559, -21.1299, 700],
  ['Kirkjufell', 'IS', 64.942, -23.3057, 600],
  ['Nyhavn', 'DK', 55.6798, 12.591, 300],
  ['Castillo de Kronborg', 'DK', 56.039, 12.6214, 400],
  ['Jardines de Tivoli', 'DK', 55.6736, 12.5681, 250],
  ['Ayuntamiento de Estocolmo', 'SE', 59.3274, 18.0545, 350],
  ['Gamla Stan', 'SE', 59.3251, 18.0711, 350],
  ['Museo Vasa', 'SE', 59.328, 18.0915, 250],
  ['Fiordo de Geiranger', 'NO', 62.1049, 7.2058, 900],
  ['Bryggen (Bergen)', 'NO', 60.3975, 5.3244, 300],
  ['Parque Vigeland', 'NO', 59.927, 10.7005, 350],
  ['Ópera de Oslo', 'NO', 59.9075, 10.7527, 250],
  ['Trollstigen', 'NO', 62.455, 7.669, 700],
  ['Reine (Lofoten)', 'NO', 67.933, 13.089, 700],
  ['Cabo Norte', 'NO', 71.1694, 25.7842, 500],
  ['Catedral de Helsinki', 'FI', 60.1704, 24.9522, 300],
  ['Fortaleza de Suomenlinna', 'FI', 60.145, 24.988, 350],
  ['Aldea de Papá Noel (Rovaniemi)', 'FI', 66.5436, 25.8474, 400],
  ['Gásadalur (Islas Feroe)', 'FO', 62.106, -7.181, 500],
  ['La Valeta', 'MT', 35.8989, 14.5146, 350],
  ['Mdina', 'MT', 35.8861, 14.402, 300],
  ['Peñón de Gibraltar', 'GI', 36.133, -5.345, 500],
  ['Andorra la Vella', 'AD', 42.5078, 1.5211, 400],
  // Estados Unidos
  ['Estatua de la Libertad', 'US', 40.6892, -74.0445, 500],
  ['Times Square', 'US', 40.758, -73.9855, 300],
  ['Empire State Building', 'US', 40.7484, -73.9857, 300],
  ['Puente de Brooklyn', 'US', 40.7061, -73.9969, 400],
  ['Central Park (Bethesda Terrace)', 'US', 40.7742, -73.9712, 400],
  ['Memorial del 11 de Septiembre', 'US', 40.7115, -74.0134, 250],
  ['Grand Central Terminal', 'US', 40.7527, -73.9772, 250],
  ['High Line', 'US', 40.748, -74.0048, 350],
  ['Puente Golden Gate', 'US', 37.8199, -122.4783, 600],
  ['Calle Lombard', 'US', 37.8021, -122.4187, 250],
  ['Puente Bixby (Big Sur)', 'US', 36.3715, -121.902, 500],
  ['Observatorio Griffith (letrero de Hollywood)', 'US', 34.1184, -118.3004, 500],
  ['Paseo de la Fama de Hollywood', 'US', 34.1016, -118.3387, 300],
  ['Muelle de Santa Mónica', 'US', 34.01, -118.4962, 350],
  ['Venice Beach', 'US', 33.985, -118.4695, 400],
  ['Las Vegas Strip', 'US', 36.1147, -115.1728, 600],
  ['Presa Hoover', 'US', 36.0161, -114.7377, 500],
  ['Gran Cañón (South Rim)', 'US', 36.0544, -112.1401, 1500],
  ['Horseshoe Bend', 'US', 36.8791, -111.5104, 500],
  ['Monument Valley', 'US', 36.998, -110.0985, 1500],
  ['Sedona', 'US', 34.8697, -111.761, 1000],
  ['Monte Rushmore', 'US', 43.8791, -103.4591, 600],
  ['Parque Nacional Badlands', 'US', 43.8554, -102.3397, 1200],
  ['Yellowstone (Old Faithful)', 'US', 44.4605, -110.8281, 800],
  ['Parque Nacional Grand Teton', 'US', 43.7904, -110.6818, 1000],
  ['Valle de Yosemite', 'US', 37.7459, -119.5936, 1000],
  ['Parque Nacional Zion', 'US', 37.2982, -113.0263, 1000],
  ['Bryce Canyon', 'US', 37.593, -112.1871, 1000],
  ['Parque Nacional Arches', 'US', 38.7331, -109.5925, 1200],
  ['Parque Nacional Glacier (Going-to-the-Sun)', 'US', 48.696, -113.718, 1500],
  ['Lago del Cráter', 'US', 42.9446, -122.109, 1000],
  ['Capitolio de Estados Unidos', 'US', 38.8899, -77.0091, 400],
  ['Casa Blanca', 'US', 38.8977, -77.0365, 350],
  ['Monumento a Lincoln', 'US', 38.8893, -77.0502, 400],
  ['Independence Hall (Filadelfia)', 'US', 39.9489, -75.15, 300],
  ['Cloud Gate (Chicago)', 'US', 41.8827, -87.6233, 250],
  ['Torre Willis', 'US', 41.8789, -87.6359, 300],
  ['Space Needle', 'US', 47.6205, -122.3493, 300],
  ['Pike Place Market', 'US', 47.6097, -122.3422, 250],
  ['Gateway Arch (San Luis)', 'US', 38.6247, -90.1848, 400],
  ['Graceland', 'US', 35.0458, -90.0232, 300],
  ['Broadway (Nashville)', 'US', 36.1612, -86.7785, 300],
  ['Bourbon Street', 'US', 29.9584, -90.0652, 250],
  ['El Álamo', 'US', 29.426, -98.4861, 250],
  ['Centro Espacial Kennedy', 'US', 28.5729, -80.649, 800],
  ['Ocean Drive (Miami Beach)', 'US', 25.7824, -80.13, 300],
  ['Punto más austral de EE.UU. (Key West)', 'US', 24.5465, -81.7975, 400],
  ['Forsyth Park (Savannah)', 'US', 32.0694, -81.096, 300],
  ['Rainbow Row (Charleston)', 'US', 32.7764, -79.929, 250],
  ['Parque Nacional Acadia', 'US', 44.3529, -68.2247, 800],
  ['Cataratas del Niágara (lado estadounidense)', 'US', 43.0806, -79.0745, 400],
  ['Diamond Head (Hawái)', 'US', 21.262, -157.807, 700],
  ['Pearl Harbor', 'US', 21.365, -157.95, 400],
  // Canadá
  ['Torre CN', 'CA', 43.6426, -79.3871, 300],
  ['Cataratas del Niágara (lado canadiense)', 'CA', 43.0896, -79.0849, 500],
  ['Parlamento de Canadá', 'CA', 45.4236, -75.7009, 350],
  ['Basílica de Notre-Dame (Montreal)', 'CA', 45.5045, -73.5566, 250],
  ['Château Frontenac', 'CA', 46.8123, -71.2046, 300],
  ['Lago Louise', 'CA', 51.4254, -116.1773, 600],
  ['Banff', 'CA', 51.1784, -115.5708, 300],
  ['Campo de Hielo Columbia', 'CA', 52.219, -117.225, 1000],
  ['Peggys Cove', 'CA', 44.4919, -63.918, 500],
  ['Hopewell Rocks', 'CA', 45.817, -64.579, 400],
  ['Whistler', 'CA', 50.1163, -122.9574, 500],
  ['Parque Stanley (Vancouver)', 'CA', 49.3017, -123.1417, 800],
  ['Reloj de Vapor de Gastown', 'CA', 49.2845, -123.1089, 200],
  ['Jardines Butchart', 'CA', 48.564, -123.47, 400],
  // México, Centroamérica y el Caribe
  ['Chichén Itzá', 'MX', 20.6843, -88.5678, 500],
  ['Tulum', 'MX', 20.2114, -87.4654, 500],
  ['Uxmal', 'MX', 20.359, -89.771, 600],
  ['Palenque', 'MX', 17.4838, -92.046, 600],
  ['Teotihuacán', 'MX', 19.6925, -98.8438, 700],
  ['Monte Albán', 'MX', 17.044, -96.768, 500],
  ['Pirámide de Cholula', 'MX', 19.058, -98.302, 400],
  ['Catedral Metropolitana de México', 'MX', 19.434, -99.1329, 300],
  ['Palacio de Bellas Artes', 'MX', 19.4352, -99.1412, 250],
  ['Ángel de la Independencia', 'MX', 19.427, -99.1677, 250],
  ['Castillo de Chapultepec', 'MX', 19.4204, -99.1819, 400],
  ['Xochimilco', 'MX', 19.258, -99.104, 500],
  ['Museo Frida Kahlo', 'MX', 19.355, -99.1625, 200],
  ['Callejón del Beso (Guanajuato)', 'MX', 21.019, -101.2574, 500],
  ['Parroquia de San Miguel de Allende', 'MX', 20.9144, -100.745, 300],
  ['Arco de Los Cabos', 'MX', 22.8757, -109.8929, 500],
  ['Quinta Avenida (Playa del Carmen)', 'MX', 20.629, -87.074, 300],
  ['La Quebrada (Acapulco)', 'MX', 16.849, -99.916, 300],
  ['Arco de Santa Catalina (Antigua Guatemala)', 'GT', 14.5586, -90.7338, 300],
  ['Lago de Atitlán (Panajachel)', 'GT', 14.742, -91.159, 500],
  ['Canal de Panamá (Miraflores)', 'PA', 8.996, -79.594, 500],
  ['Casco Viejo (Panamá)', 'PA', 8.952, -79.535, 350],
  ['Teatro Nacional (San José)', 'CR', 9.934, -84.078, 200],
  ['Zona Colonial (Santo Domingo)', 'DO', 18.473, -69.883, 350],
  ['Fuerte San Felipe del Morro', 'PR', 18.471, -66.124, 400],
  // América del Sur
  ['Machu Picchu', 'PE', -13.1631, -72.545, 600],
  ['Sacsayhuamán', 'PE', -13.5088, -71.9817, 400],
  ['Plaza de Armas de Cusco', 'PE', -13.5167, -71.9786, 250],
  ['Ollantaytambo', 'PE', -13.258, -72.264, 350],
  ['Pisac', 'PE', -13.422, -71.849, 350],
  ['Líneas de Nazca (mirador)', 'PE', -14.739, -75.13, 1000],
  ['Huacachina', 'PE', -14.0875, -75.7633, 400],
  ['Cañón del Colca (Cruz del Cóndor)', 'PE', -15.613, -71.892, 600],
  ['Chan Chan', 'PE', -8.105, -79.075, 500],
  ['Cristo Redentor', 'BR', -22.9519, -43.2105, 400],
  ['Pan de Azúcar', 'BR', -22.9492, -43.1545, 400],
  ['Playa de Copacabana', 'BR', -22.9711, -43.1822, 500],
  ['Escalera Selarón', 'BR', -22.9153, -43.179, 200],
  ['Estadio Maracanã', 'BR', -22.9121, -43.2302, 350],
  ['Avenida Paulista', 'BR', -23.5614, -46.6559, 400],
  ['Catedral da Sé (São Paulo)', 'BR', -23.5502, -46.634, 250],
  ['Parque Ibirapuera', 'BR', -23.5874, -46.6576, 500],
  ['Pelourinho (Salvador)', 'BR', -12.9711, -38.5108, 300],
  ['Elevador Lacerda', 'BR', -12.9738, -38.5134, 250],
  ['Congreso Nacional (Brasilia)', 'BR', -15.7997, -47.861, 500],
  ['Catedral de Brasilia', 'BR', -15.7989, -47.8755, 350],
  ['Teatro Amazonas', 'BR', -3.1303, -60.0233, 250],
  ['Ouro Preto', 'BR', -20.3856, -43.5035, 400],
  ['Paraty', 'BR', -23.2178, -44.7131, 300],
  ['Olinda', 'BR', -8.0143, -34.855, 400],
  ['Gramado', 'BR', -29.379, -50.874, 400],
  ['Represa de Itaipú', 'BR', -25.4087, -54.589, 600],
  ['Obelisco', 'AR', -34.6037, -58.3816, 300],
  ['Casa Rosada', 'AR', -34.6083, -58.3702, 300],
  ['Puente de la Mujer', 'AR', -34.6084, -58.3632, 250],
  ['Caminito (La Boca)', 'AR', -34.6392, -58.3636, 400],
  ['Cementerio de la Recoleta', 'AR', -34.5876, -58.3931, 300],
  ['Teatro Colón', 'AR', -34.601, -58.383, 250],
  ['Floralis Genérica', 'AR', -34.58, -58.394, 300],
  ['Cataratas del Iguazú (Garganta del Diablo)', 'AR', -25.6953, -54.4367, 600],
  ['Glaciar Perito Moreno', 'AR', -50.496, -73.137, 900],
  ['Cerro Fitz Roy (El Chaltén)', 'AR', -49.3314, -72.8863, 800],
  ['Cerro de los Siete Colores (Purmamarca)', 'AR', -23.7447, -65.4995, 600],
  ['Pucará de Tilcara', 'AR', -23.584, -65.399, 300],
  ['Salinas Grandes', 'AR', -23.6, -65.756, 1000],
  ['Quebrada de las Conchas (Cafayate)', 'AR', -26.083, -65.95, 1500],
  ['Puente del Inca (Aconcagua)', 'AR', -32.8232, -69.9189, 500],
  ['Cerro Catedral (Bariloche)', 'AR', -41.166, -71.439, 700],
  ['Llao Llao', 'AR', -41.057, -71.527, 600],
  ['Puerto Pirámides (Península Valdés)', 'AR', -42.5783, -64.285, 600],
  ['Parque Nacional Tierra del Fuego', 'AR', -54.8453, -68.5367, 1200],
  ['Manzana Jesuítica (Córdoba)', 'AR', -31.417, -64.188, 250],
  ['Plaza Independencia (Mendoza)', 'AR', -32.89, -68.844, 250],
  ['Torres del Paine', 'CL', -51.0, -73.0, 2500],
  ['Moáis de Ahu Tongariki (Isla de Pascua)', 'CL', -27.1259, -109.2767, 500],
  ['San Pedro de Atacama', 'CL', -22.9087, -68.2, 600],
  ['Valle de la Luna (Atacama)', 'CL', -22.92, -68.28, 1500],
  ['Palacio de La Moneda', 'CL', -33.4429, -70.6541, 250],
  ['Cerro San Cristóbal', 'CL', -33.423, -70.631, 500],
  ['Reloj de Flores (Viña del Mar)', 'CL', -33.0208, -71.553, 250],
  ['Iglesia de Castro (Chiloé)', 'CL', -42.48, -73.764, 300],
  ['Volcán Osorno (Puerto Varas)', 'CL', -41.105, -72.55, 1500],
  ['Palacio Salvo', 'UY', -34.9066, -56.2012, 250],
  ['Palacio Legislativo', 'UY', -34.8895, -56.187, 300],
  ['Casapueblo', 'UY', -34.919, -54.939, 300],
  ['Panteón de los Héroes', 'PY', -25.2822, -57.635, 250],
  ['Monserrate (Bogotá)', 'CO', 4.6055, -74.0562, 400],
  ['Plaza de Bolívar (Bogotá)', 'CO', 4.5981, -74.076, 250],
  ['Catedral de Sal de Zipaquirá', 'CO', 5.0167, -74.0083, 400],
  ['Valle de Cocora', 'CO', 4.6378, -75.4889, 900],
  ['Plaza Botero (Medellín)', 'CO', 6.2518, -75.5685, 250],
  ['Comuna 13 (Medellín)', 'CO', 6.257, -75.613, 300],
  ['Piedra del Peñol (Guatapé)', 'CO', 6.22, -75.179, 500],
  ['Castillo San Felipe de Barajas (Cartagena)', 'CO', 10.423, -75.539, 300],
  ['Barichara', 'CO', 6.637, -73.223, 300],
  ['Villa de Leyva', 'CO', 5.633, -73.526, 300],
  ['Mitad del Mundo', 'EC', -0.0022, -78.4558, 300],
  ['Basílica del Voto Nacional (Quito)', 'EC', -0.2158, -78.511, 250],
  ['Plaza Grande (Quito)', 'EC', -0.22, -78.5125, 250],
  ['Catedral Nueva de Cuenca', 'EC', -2.8975, -79.0045, 250],
  ['Volcán Cotopaxi', 'EC', -0.684, -78.437, 1500],
  ['Casa del Árbol (Baños)', 'EC', -1.4, -78.433, 500],
  ['Puerto Ayora (Galápagos)', 'EC', -0.7393, -90.3131, 600],
  ['Plaza Murillo (La Paz)', 'BO', -16.4957, -68.1336, 250],
  ['Teleférico de La Paz', 'BO', -16.5, -68.15, 600],
  ['Plaza 25 de Mayo (Sucre)', 'BO', -19.0478, -65.2596, 250],
  ['Cristo de la Concordia (Cochabamba)', 'BO', -17.3844, -66.134, 350],
  ['Copacabana (Lago Titicaca)', 'BO', -16.166, -69.087, 400],
  // Asia
  ['Templo Senso-ji', 'JP', 35.7148, 139.7967, 300],
  ['Torre de Tokio', 'JP', 35.6586, 139.7454, 300],
  ['Tokyo Skytree', 'JP', 35.7101, 139.8107, 300],
  ['Cruce de Shibuya', 'JP', 35.6595, 139.7005, 300],
  ['Palacio Imperial de Tokio', 'JP', 35.6852, 139.7528, 350],
  ['Monte Fuji (Lago Kawaguchi)', 'JP', 35.5, 138.76, 1500],
  ['Lago Ashi (Hakone)', 'JP', 35.205, 139.025, 800],
  ['Gran Buda de Kamakura', 'JP', 35.3168, 139.5358, 300],
  ['Santuario Toshogu (Nikko)', 'JP', 36.758, 139.5988, 350],
  ['Castillo de Matsumoto', 'JP', 36.2381, 137.9688, 300],
  ['Shirakawa-go', 'JP', 36.2578, 136.9063, 500],
  ['Kinkaku-ji', 'JP', 35.0394, 135.7292, 300],
  ['Fushimi Inari', 'JP', 34.9671, 135.7727, 400],
  ['Kiyomizu-dera', 'JP', 34.9949, 135.785, 300],
  ['Bosque de bambú de Arashiyama', 'JP', 35.017, 135.6713, 300],
  ['Gion (Kioto)', 'JP', 35.0037, 135.7756, 250],
  ['Castillo de Osaka', 'JP', 34.6873, 135.5262, 400],
  ['Dōtonbori', 'JP', 34.6687, 135.5013, 300],
  ['Castillo de Himeji', 'JP', 34.8394, 134.6939, 400],
  ['Templo Todai-ji (Nara)', 'JP', 34.689, 135.8398, 400],
  ['Santuario de Itsukushima (Miyajima)', 'JP', 34.296, 132.3198, 500],
  ['Cúpula de la Bomba Atómica', 'JP', 34.3955, 132.4536, 300],
  ['Palacio Gyeongbokgung', 'KR', 37.5796, 126.977, 400],
  ['Torre N de Seúl', 'KR', 37.5512, 126.9882, 350],
  ['Aldea Hanok de Bukchon', 'KR', 37.5826, 126.983, 250],
  ['Aldea cultural de Gamcheon', 'KR', 35.0975, 129.0106, 400],
  ['Playa de Haeundae', 'KR', 35.1587, 129.1604, 400],
  ['Templo Bulguksa', 'KR', 35.79, 129.332, 400],
  ['Seongsan Ilchulbong (Jeju)', 'KR', 33.458, 126.9425, 500],
  ['Taipei 101', 'TW', 25.034, 121.5645, 300],
  ['Templo Longshan', 'TW', 25.0372, 121.4999, 250],
  ['Jiufen', 'TW', 25.109, 121.845, 300],
  ['Lago del Sol y la Luna', 'TW', 23.856, 120.915, 800],
  ['Garganta de Taroko', 'TW', 24.1594, 121.6212, 800],
  ['Victoria Peak', 'HK', 22.2759, 114.1455, 350],
  ['Gran Buda de Tian Tan', 'HK', 22.254, 113.9049, 500],
  ['Avenida de las Estrellas (Hong Kong)', 'HK', 22.293, 114.174, 300],
  ['Ruinas de San Pablo (Macao)', 'MO', 22.197, 113.5408, 250],
  ['Gran Palacio de Bangkok', 'TH', 13.75, 100.4913, 350],
  ['Wat Arun', 'TH', 13.7437, 100.4888, 300],
  ['Templo Blanco (Chiang Rai)', 'TH', 19.8241, 99.7633, 400],
  ['Wat Phra That Doi Suthep', 'TH', 18.8048, 98.9216, 400],
  ['Ayutthaya', 'TH', 14.3563, 100.5576, 700],
  ['Angkor Wat', 'KH', 13.4125, 103.867, 700],
  ['Bayon (Angkor Thom)', 'KH', 13.4413, 103.859, 400],
  ['Puente Japonés de Hoi An', 'VN', 15.877, 108.3262, 250],
  ['Catedral de Notre-Dame (Ho Chi Minh)', 'VN', 10.7798, 106.699, 250],
  ['Intramuros (Manila)', 'PH', 14.5896, 120.9748, 350],
  ['Torres Petronas', 'MY', 3.1579, 101.7116, 400],
  ['Cuevas de Batu', 'MY', 3.2379, 101.684, 400],
  ['Stadthuys (Malaca)', 'MY', 2.1944, 102.2495, 300],
  ['George Town (Penang)', 'MY', 5.4164, 100.3327, 350],
  ['Marina Bay Sands', 'SG', 1.2834, 103.8607, 450],
  ['Gardens by the Bay', 'SG', 1.2816, 103.8636, 450],
  ['Merlion', 'SG', 1.2868, 103.8545, 250],
  ['Borobudur', 'ID', -7.6079, 110.2038, 500],
  ['Prambanan', 'ID', -7.752, 110.4915, 500],
  ['Monas (Yakarta)', 'ID', -6.1754, 106.8272, 350],
  ['Volcán Bromo', 'ID', -7.9425, 112.953, 1200],
  ['Tanah Lot (Bali)', 'ID', -8.6212, 115.0868, 400],
  ['Uluwatu (Bali)', 'ID', -8.8291, 115.0849, 400],
  ['Terrazas de arroz de Tegallalang (Bali)', 'ID', -8.4312, 115.2793, 500],
  ['Taj Mahal', 'IN', 27.1751, 78.0421, 500],
  ['Fuerte Rojo (Delhi)', 'IN', 28.6562, 77.241, 400],
  ['Puerta de la India (Delhi)', 'IN', 28.6129, 77.2295, 400],
  ['Qutub Minar', 'IN', 28.5245, 77.1855, 350],
  ['Tumba de Humayun', 'IN', 28.5933, 77.2507, 300],
  ['Templo del Loto', 'IN', 28.5535, 77.2588, 250],
  ['Fuerte Amber (Jaipur)', 'IN', 26.9855, 75.8513, 500],
  ['Hawa Mahal', 'IN', 26.9239, 75.8267, 250],
  ['Fuerte de Jaisalmer', 'IN', 26.9124, 70.9126, 350],
  ['Puerta de la India (Bombay)', 'IN', 18.922, 72.8347, 300],
  ['Palacio de Mysore', 'IN', 12.3052, 76.6552, 400],
  ['Charminar', 'IN', 17.3616, 78.4747, 250],
  ['Victoria Memorial (Calcuta)', 'IN', 22.5448, 88.3426, 350],
  ['Templo Dorado (Amritsar)', 'IN', 31.62, 74.8765, 350],
  ['Ghats de Benarés', 'IN', 25.3109, 83.0107, 400],
  ['Templo de la Costa (Mahabalipuram)', 'IN', 12.6164, 80.1992, 300],
  ['Hampi', 'IN', 15.335, 76.46, 1000],
  ['Sigiriya', 'LK', 7.957, 80.7603, 500],
  ['Templo del Diente (Kandy)', 'LK', 7.2936, 80.6413, 300],
  ['Puente de los Nueve Arcos (Ella)', 'LK', 6.8768, 81.0605, 400],
  ['Fuerte de Galle', 'LK', 6.0268, 80.217, 350],
  ['Estatua de Gengis Kan', 'MN', 47.8085, 107.532, 600],
  ['Plaza Sükhbaatar', 'MN', 47.9186, 106.9177, 250],
  // Medio Oriente
  ['Muro de los Lamentos', 'IL', 31.7767, 35.2345, 250],
  ['Masada', 'IL', 31.3157, 35.3536, 500],
  ['Jardines Bahaíes (Haifa)', 'IL', 32.8143, 34.987, 350],
  ['Petra', 'JO', 30.3285, 35.4444, 700],
  ['Wadi Rum', 'JO', 29.576, 35.42, 1500],
  ['Anfiteatro romano de Amán', 'JO', 31.9516, 35.9393, 250],
  ['Burj Khalifa', 'AE', 25.1972, 55.2744, 400],
  ['Museo del Futuro (Dubái)', 'AE', 25.2195, 55.2819, 250],
  ['Burj Al Arab', 'AE', 25.1412, 55.1853, 400],
  ['Palm Jumeirah (Atlantis)', 'AE', 25.1304, 55.117, 500],
  ['Gran Mezquita Sheikh Zayed', 'AE', 24.4128, 54.475, 450],
  ['Louvre Abu Dabi', 'AE', 24.5336, 54.3983, 300],
  // África
  ['Montaña de la Mesa (teleférico)', 'ZA', -33.9486, 18.4103, 500],
  ['Cabo de Buena Esperanza', 'ZA', -34.3568, 18.474, 700],
  ['V&A Waterfront', 'ZA', -33.9036, 18.4208, 400],
  ['Bo-Kaap', 'ZA', -33.92, 18.415, 300],
  ['Playa Boulders (pingüinos)', 'ZA', -34.1975, 18.451, 300],
  ['Parque Nacional Kruger (Skukuza)', 'ZA', -24.9924, 31.59, 1500],
  ['Blyde River Canyon (God’s Window)', 'ZA', -24.875, 30.892, 800],
  ['Río Storms (Tsitsikamma)', 'ZA', -33.968, 23.898, 600],
  ['Union Buildings (Pretoria)', 'ZA', -25.7407, 28.2115, 300],
  ['Calle Vilakazi (Soweto)', 'ZA', -26.2358, 27.9055, 300],
  ['Monumento del Renacimiento Africano', 'SN', 14.72, -17.496, 300],
  ['Isla de Gorée', 'SN', 14.668, -17.398, 300],
  ['Lago Rosa (Retba)', 'SN', 14.838, -17.232, 600],
  ['Castillo de Cape Coast', 'GH', 5.1054, -1.2466, 300],
  ['Anfiteatro de El Djem', 'TN', 35.2963, 10.7064, 300],
  ['Sidi Bou Said', 'TN', 36.87, 10.341, 300],
  // Oceanía
  ['Ópera de Sídney', 'AU', -33.8568, 151.2153, 400],
  ['Puente de la Bahía de Sídney', 'AU', -33.8523, 151.2108, 400],
  ['Bondi Beach', 'AU', -33.8915, 151.2767, 500],
  ['Tres Hermanas (Montañas Azules)', 'AU', -33.732, 150.312, 600],
  ['Federation Square', 'AU', -37.818, 144.9691, 250],
  ['Doce Apóstoles (Great Ocean Road)', 'AU', -38.6622, 143.1039, 600],
  ['South Bank (Brisbane)', 'AU', -27.4735, 153.0208, 350],
  ['Surfers Paradise', 'AU', -28.0023, 153.43, 400],
  ['Cabo Byron', 'AU', -28.638, 153.637, 500],
  ['Uluru', 'AU', -25.3444, 131.0369, 1500],
  ['Wave Rock', 'AU', -32.444, 118.898, 500],
  ['Cable Beach (Broome)', 'AU', -17.954, 122.21, 500],
  ['Bahía Wineglass (Tasmania)', 'AU', -42.156, 148.308, 600],
  ['Sky Tower (Auckland)', 'NZ', -36.8485, 174.7633, 300],
  ['Hobbiton', 'NZ', -37.8722, 175.683, 500],
  ['Wai-O-Tapu', 'NZ', -38.359, 176.366, 600],
  ['Milford Sound', 'NZ', -44.6714, 167.9253, 700],
  ['Lago Tekapo', 'NZ', -44.0059, 170.4773, 500],
  ['Valle Hooker (Monte Cook)', 'NZ', -43.734, 170.096, 1000],
  ['Glaciar Franz Josef', 'NZ', -43.467, 170.183, 800],
  ['Rocas Moeraki', 'NZ', -45.346, 170.827, 400]
]

/**
 * Capitals of the provinces of Argentina (the 23 provinces + Buenos Aires
 * city), only in "Argentina". The ones that are already places of another map
 * (Buenos Aires, Mendoza, Córdoba, Salta, Posadas...) are shared with it: the
 * place that already exists wins, so its coordinates here are only informative.
 */
const ARGENTINA_CAPITALS: PlaceRow[] = [
  ['Buenos Aires', 'AR', -34.6037, -58.3816, 5000],
  ['La Plata', 'AR', -34.9214, -57.9544, 5000],
  ['Catamarca', 'AR', -28.4696, -65.7795, 3000],
  ['Resistencia', 'AR', -27.4606, -58.9839, 4000],
  ['Rawson', 'AR', -43.3002, -65.1023, 2000],
  ['Córdoba', 'AR', -31.4201, -64.1888, 7000],
  ['Corrientes', 'AR', -27.4692, -58.8306, 4000],
  ['Paraná', 'AR', -31.7333, -60.5297, 4000],
  ['Formosa', 'AR', -26.1775, -58.1781, 3500],
  ['San Salvador de Jujuy', 'AR', -24.1858, -65.2995, 3000],
  ['Santa Rosa', 'AR', -36.6203, -64.2906, 3000],
  ['La Rioja', 'AR', -29.4131, -66.8558, 3000],
  ['Mendoza', 'AR', -32.8895, -68.8458, 5000],
  ['Posadas', 'AR', -27.3671, -55.8961, 4000],
  ['Neuquén', 'AR', -38.9516, -68.0591, 4000],
  ['Viedma', 'AR', -40.8135, -62.9967, 2500],
  ['Salta', 'AR', -24.7821, -65.4232, 4000],
  ['San Juan', 'AR', -31.5375, -68.5364, 4000],
  ['San Luis', 'AR', -33.295, -66.3356, 3500],
  ['Río Gallegos', 'AR', -51.6226, -69.2181, 3000],
  ['Santa Fe', 'AR', -31.6333, -60.7, 4000],
  ['Santiago del Estero', 'AR', -27.7951, -64.2615, 4000],
  ['Ushuaia', 'AR', -54.8019, -68.303, 3000],
  ['San Miguel de Tucumán', 'AR', -26.8083, -65.2176, 5000]
]

/**
 * Capitals of the provinces of the Iberian Peninsula of Spain (47 of the 50
 * provinces: the Balearic and Canary islands are left out, as they were of the
 * old peninsular outline), only in "España". Shared with the maps that already
 * have them (Madrid, Barcelona, Zaragoza, Córdoba...).
 */
const SPAIN_CAPITALS: PlaceRow[] = [
  ['A Coruña', 'ES', 43.3623, -8.4115, 4000],
  ['Albacete', 'ES', 38.9943, -1.8585, 3000],
  ['Alicante', 'ES', 38.3452, -0.481, 4000],
  ['Almería', 'ES', 36.834, -2.4637, 3500],
  ['Ávila', 'ES', 40.6564, -4.7006, 2000],
  ['Badajoz', 'ES', 38.8794, -6.9707, 3000],
  ['Barcelona', 'ES', 41.3874, 2.1686, 5000],
  ['Burgos', 'ES', 42.3439, -3.6969, 3000],
  ['Cáceres', 'ES', 39.4753, -6.3724, 2500],
  ['Cádiz', 'ES', 36.5271, -6.2886, 2500],
  ['Castellón de la Plana', 'ES', 39.9864, -0.0513, 3000],
  ['Ciudad Real', 'ES', 38.9863, -3.9291, 2500],
  ['Córdoba', 'ES', 37.8882, -4.7794, 3500],
  ['Cuenca', 'ES', 40.0704, -2.1374, 2000],
  ['Girona', 'ES', 41.9794, 2.8214, 2500],
  ['Granada', 'ES', 37.1773, -3.5986, 3000],
  ['Guadalajara', 'ES', 40.6329, -3.1667, 2500],
  ['San Sebastián', 'ES', 43.3183, -1.9812, 3000],
  ['Huelva', 'ES', 37.2614, -6.9447, 3000],
  ['Huesca', 'ES', 42.1401, -0.4089, 2000],
  ['Jaén', 'ES', 37.7796, -3.7849, 3000],
  ['León', 'ES', 42.5987, -5.5671, 3000],
  ['Lleida', 'ES', 41.6176, 0.62, 3000],
  ['Logroño', 'ES', 42.4627, -2.445, 3000],
  ['Lugo', 'ES', 43.0097, -7.5568, 2500],
  ['Madrid', 'ES', 40.4168, -3.7038, 7000],
  ['Málaga', 'ES', 36.7213, -4.4214, 4000],
  ['Murcia', 'ES', 37.9922, -1.1307, 4000],
  ['Ourense', 'ES', 42.3358, -7.8639, 2500],
  ['Oviedo', 'ES', 43.3614, -5.8494, 3000],
  ['Palencia', 'ES', 42.0096, -4.5288, 2500],
  ['Pamplona', 'ES', 42.8125, -1.6458, 3000],
  ['Pontevedra', 'ES', 42.431, -8.6446, 2500],
  ['Salamanca', 'ES', 40.9701, -5.6635, 3000],
  ['Santander', 'ES', 43.4623, -3.8099, 3500],
  ['Segovia', 'ES', 40.9429, -4.1088, 2000],
  ['Sevilla', 'ES', 37.3891, -5.9845, 5000],
  ['Soria', 'ES', 41.7636, -2.4649, 2000],
  ['Tarragona', 'ES', 41.1189, 1.2445, 3000],
  ['Teruel', 'ES', 40.3456, -1.1065, 1500],
  ['Toledo', 'ES', 39.8628, -4.0273, 2500],
  ['Valencia', 'ES', 39.4699, -0.3763, 5000],
  ['Valladolid', 'ES', 41.6523, -4.7245, 4000],
  ['Bilbao', 'ES', 43.263, -2.935, 4000],
  ['Vitoria-Gasteiz', 'ES', 42.8467, -2.6716, 3000],
  ['Zamora', 'ES', 41.5033, -5.7446, 2000],
  ['Zaragoza', 'ES', 41.6488, -0.8891, 5000]
]

/**
 * Capitals of the 48 continental states of the United States (Alaska and
 * Hawaii are left out), only in "Estados Unidos". Those whose name is shared
 * by several states carry the state in brackets. Shared with the maps that
 * already have them (Boston, Denver, Austin).
 */
const UNITED_STATES_CAPITALS: PlaceRow[] = [
  ['Montgomery', 'US', 32.3792, -86.3077, 3500],
  ['Phoenix', 'US', 33.4484, -112.074, 8000],
  ['Little Rock', 'US', 34.7465, -92.2896, 3500],
  ['Sacramento', 'US', 38.5816, -121.4944, 5000],
  ['Denver', 'US', 39.7392, -104.9903, 6000],
  ['Hartford', 'US', 41.7658, -72.6734, 3000],
  ['Dover', 'US', 39.1582, -75.5244, 2000],
  ['Tallahassee', 'US', 30.4383, -84.2807, 3500],
  ['Atlanta', 'US', 33.749, -84.388, 6000],
  ['Boise', 'US', 43.615, -116.2023, 3500],
  ['Springfield (Illinois)', 'US', 39.7817, -89.6501, 3500],
  ['Indianápolis', 'US', 39.7684, -86.1581, 6000],
  ['Des Moines', 'US', 41.5868, -93.625, 4000],
  ['Topeka', 'US', 39.0473, -95.6752, 3000],
  ['Frankfort', 'US', 38.2009, -84.8733, 1500],
  ['Baton Rouge', 'US', 30.4515, -91.1871, 4500],
  ['Augusta (Maine)', 'US', 44.3106, -69.7795, 2000],
  ['Annapolis', 'US', 38.9784, -76.4922, 1500],
  ['Boston', 'US', 42.3601, -71.0589, 5000],
  ['Lansing', 'US', 42.7325, -84.5555, 3000],
  ['Saint Paul', 'US', 44.9537, -93.09, 4000],
  ['Jackson (Misisipi)', 'US', 32.2988, -90.1848, 4000],
  ['Jefferson City', 'US', 38.5767, -92.1735, 2500],
  ['Helena', 'US', 46.5891, -112.0391, 2500],
  ['Lincoln (Nebraska)', 'US', 40.8136, -96.7026, 4500],
  ['Carson City', 'US', 39.1638, -119.7674, 2500],
  ['Concord (Nuevo Hampshire)', 'US', 43.2081, -71.5376, 2500],
  ['Trenton', 'US', 40.2206, -74.7597, 3000],
  ['Santa Fe (Nuevo México)', 'US', 35.687, -105.9378, 3000],
  ['Albany (Nueva York)', 'US', 42.6526, -73.7562, 3500],
  ['Raleigh', 'US', 35.7796, -78.6382, 5000],
  ['Bismarck', 'US', 46.8083, -100.7837, 2500],
  ['Columbus (Ohio)', 'US', 39.9612, -82.9988, 6000],
  ['Oklahoma City', 'US', 35.4676, -97.5164, 6000],
  ['Salem (Oregón)', 'US', 44.9429, -123.0351, 3500],
  ['Harrisburg', 'US', 40.2732, -76.8867, 2500],
  ['Providence', 'US', 41.824, -71.4128, 3500],
  ['Columbia (Carolina del Sur)', 'US', 34.0007, -81.0348, 4000],
  ['Pierre', 'US', 44.3683, -100.351, 1500],
  ['Nashville', 'US', 36.1627, -86.7816, 5500],
  ['Austin', 'US', 30.2672, -97.7431, 6000],
  ['Salt Lake City', 'US', 40.7608, -111.891, 5000],
  ['Montpelier', 'US', 44.2601, -72.5754, 1500],
  ['Richmond (Virginia)', 'US', 37.5407, -77.436, 4500],
  ['Olympia', 'US', 47.0379, -122.9007, 2500],
  ['Charleston (Virginia Occidental)', 'US', 38.3498, -81.6326, 3000],
  ['Madison', 'US', 43.0731, -89.4012, 4500],
  ['Cheyenne', 'US', 41.14, -104.8202, 3000]
]

const PLACES: SeedPlace[] = [
  ...BASE_PLACES,
  ...circlesOf(LATIN_AMERICA_CITIES, LATIN_AMERICA_MAP),
  ...circlesOf(EUROPE_CITIES, EUROPE_MAP),
  ...circlesOf(LANDMARKS, LANDMARKS_MAP)
]

/**
 * Adds the capitals of a country map to `places`: a capital that already
 * exists (same name and country, e.g. Mendoza, which is also a city of the
 * world) is linked to the map too; the other ones are new places only in that
 * map.
 */
function addCapitals(places: SeedPlace[], rows: PlaceRow[], map: string): void {
  const existing = new Map(places.map((place) => [`${place.name}|${place.countryCode}`, place]))

  for (const [name, countryCode, latitude, longitude, radius] of rows) {
    const place = existing.get(`${name}|${countryCode}`)

    if (place) {
      place.alsoIn = [...(place.alsoIn ?? []), map]
    } else {
      places.push({ name, countryCode, onlyMap: map, geometry: circle(latitude, longitude, radius) })
    }
  }
}

addCapitals(PLACES, ARGENTINA_CAPITALS, ARGENTINA_MAP)
addCapitals(PLACES, SPAIN_CAPITALS, SPAIN_MAP)
addCapitals(PLACES, UNITED_STATES_CAPITALS, UNITED_STATES_MAP)
/** Rows per INSERT: keeps every statement well under the parameter limits of the databases. */
const INSERT_CHUNK_SIZE = 100

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size)
  )
}

export default {
  name: '002-seed-maps',

  async up(): Promise<void> {
    if (await DB.table('maps').where('name', MAPS[0].name).first()) {
      return
    }

    await DB.transaction(async () => {
      for (const chunk of chunks(PLACES, INSERT_CHUNK_SIZE)) {
        await DB.table('places').insert(
          chunk.map((place) => ({
            name: place.name,
            countryCode: place.countryCode,
            geometry: JSON.stringify(place.geometry),
            enabled: true
          }))
        )
      }

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

        for (const chunk of chunks(PLACES.filter(map.places), INSERT_CHUNK_SIZE)) {
          await DB.table('map_places').insert(
            chunk.map((place) => ({
              mapId: mapRow!.id,
              placeId: placeIds.get(`${place.name}|${place.countryCode}`)
            }))
          )
        }
      }
    })
  }
}
