import COUNTRY_BORDERS from '@/app/(protected)/(game)/data/countryBorders.json'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'

/**
 * The country a point is in, from the borders of data/countryBorders.json:
 * Natural Earth's 1:50m countries (public domain, naturalearthdata.com),
 * reduced to their ISO 3166-1 alpha-2 code and polygons ([longitude,
 * latitude], 3 decimals). Server only: the file weighs ~1.6 MB.
 */

/**
 * A guess this close to the location of its round (meters) is always in the
 * right country: the borders are coarse (coasts, small countries like the
 * Vatican, cities right on a border), so the country under the pin may be
 * none, or the neighbor.
 */
export const RIGHT_COUNTRY_FALLBACK_METERS = 25000

type Ring = [number, number][]
type Polygon = Ring[]

interface Country {
  code: string
  polygons: Polygon[]
  /** [minLongitude, minLatitude, maxLongitude, maxLatitude] of all its polygons. */
  bbox: [number, number, number, number]
}

let countries: Country[] | null = null

function getCountries(): Country[] {
  countries ??= Object.entries(COUNTRY_BORDERS as unknown as Record<string, Polygon[]>).map(([code, polygons]) => {
    const points = polygons.flatMap((polygon) => polygon[0] ?? [])
    const longitudes = points.map(([longitude]) => longitude)
    const latitudes = points.map(([, latitude]) => latitude)

    return {
      code,
      polygons,
      bbox: [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)]
    }
  })

  return countries
}

/** Ray casting: whether the point is inside the ring. */
function inRing(longitude: number, latitude: number, ring: Ring): boolean {
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]

    if (yi > latitude !== yj > latitude && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/** Inside the outer ring of the polygon and out of its holes. */
function inPolygon(longitude: number, latitude: number, [outer, ...holes]: Polygon): boolean {
  return !!outer && inRing(longitude, latitude, outer) && !holes.some((hole) => inRing(longitude, latitude, hole))
}

/** ISO code of the country the point is in, or null (the sea, or a country too small for the borders). */
export function getCountryAt(latitude: number, longitude: number): string | null {
  const country = getCountries().find(
    ({ polygons, bbox: [minLongitude, minLatitude, maxLongitude, maxLatitude] }) =>
      longitude >= minLongitude &&
      longitude <= maxLongitude &&
      latitude >= minLatitude &&
      latitude <= maxLatitude &&
      polygons.some((polygon) => inPolygon(longitude, latitude, polygon))
  )

  return country?.code ?? null
}

/** Whether a guess fell in the country of its round (or closer to it than RIGHT_COUNTRY_FALLBACK_METERS). */
export function isRightCountry(guess: GameGuess | null, round: GameRound): boolean {
  if (!guess || guess.latitude === null || guess.longitude === null) {
    return false
  }

  if (guess.distanceMeters !== null && guess.distanceMeters < RIGHT_COUNTRY_FALLBACK_METERS) {
    return true
  }

  return getCountryAt(guess.latitude, guess.longitude) === round.countryCode.toUpperCase()
}
