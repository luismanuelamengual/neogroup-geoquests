import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import {
  CircleGeometry,
  isCircleGeometry,
  PlaceGeometry,
  PolygonGeometry
} from '@/app/(protected)/(game)/models/PlaceGeometry'

/**
 * Pure geographic helpers (no dependencies). Distances use a spherical Earth,
 * which is more than precise enough for scoring a guess.
 */

/** Mean Earth radius in meters. */
export const EARTH_RADIUS_METERS = 6_371_008.8

/** Source of randomness in [0, 1). Injectable so the helpers are testable. */
export type RandomFn = () => number

export interface BoundingBox {
  minLatitude: number
  minLongitude: number
  maxLatitude: number
  maxLongitude: number
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/** Great-circle distance in meters between two positions (haversine formula). */
export function haversineDistance(from: LatLng, to: LatLng): number {
  const deltaLatitude = toRadians(to.latitude - from.latitude)
  const deltaLongitude = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLongitude / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)))
}

/**
 * Position reached travelling `distanceMeters` from `origin` along the initial
 * `bearingDegrees` (0 = north, 90 = east).
 */
export function destinationPoint(origin: LatLng, distanceMeters: number, bearingDegrees: number): LatLng {
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS
  const bearing = toRadians(bearingDegrees)
  const latitude1 = toRadians(origin.latitude)
  const longitude1 = toRadians(origin.longitude)
  const latitude2 = Math.asin(
    Math.sin(latitude1) * Math.cos(angularDistance) +
      Math.cos(latitude1) * Math.sin(angularDistance) * Math.cos(bearing)
  )
  const longitude2 =
    longitude1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude1),
      Math.cos(angularDistance) - Math.sin(latitude1) * Math.sin(latitude2)
    )

  return { latitude: toDegrees(latitude2), longitude: normalizeLongitude(toDegrees(longitude2)) }
}

/** Wraps a longitude into [-180, 180). */
export function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180
}

/**
 * Uniformly distributed random position inside a circle. The distance uses
 * `R·√u` (not `R·u`) so points do not cluster around the center.
 */
export function randomPointInCircle(center: LatLng, radiusMeters: number, random: RandomFn = Math.random): LatLng {
  const distance = radiusMeters * Math.sqrt(random())
  const bearing = random() * 360

  return destinationPoint(center, distance, bearing)
}

/** Ray-casting point-in-polygon test against the outer ring of a GeoJSON polygon (holes are honoured too). */
export function isPointInPolygon(point: LatLng, polygon: PolygonGeometry): boolean {
  const [outerRing, ...holes] = polygon.coordinates

  if (!outerRing || !isPointInRing(point, outerRing)) {
    return false
  }

  return !holes.some((hole) => isPointInRing(point, hole))
}

function isPointInRing(point: LatLng, ring: number[][]): boolean {
  const x = point.longitude
  const y = point.latitude
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

/** Bounding box of the outer ring of a GeoJSON polygon. */
export function polygonBoundingBox(polygon: PolygonGeometry): BoundingBox {
  const ring = polygon.coordinates[0] ?? []
  const longitudes = ring.map(([longitude]) => longitude)
  const latitudes = ring.map(([, latitude]) => latitude)

  return {
    minLatitude: Math.min(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLatitude: Math.max(...latitudes),
    maxLongitude: Math.max(...longitudes)
  }
}

/**
 * Random position inside a polygon, by rejection sampling over its bounding
 * box. Latitude is sampled on sin(latitude) so the distribution stays uniform
 * in area. Returns null if no point was accepted after `maxAttempts` (only
 * possible with degenerate polygons).
 */
export function randomPointInPolygon(
  polygon: PolygonGeometry,
  random: RandomFn = Math.random,
  maxAttempts = 1000
): LatLng | null {
  const box = polygonBoundingBox(polygon)
  const minSin = Math.sin(toRadians(box.minLatitude))
  const maxSin = Math.sin(toRadians(box.maxLatitude))

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const point = {
      latitude: toDegrees(Math.asin(minSin + random() * (maxSin - minSin))),
      longitude: box.minLongitude + random() * (box.maxLongitude - box.minLongitude)
    }

    if (isPointInPolygon(point, polygon)) {
      return point
    }
  }

  return null
}

/** Center of a circle geometry. */
export function circleCenter(circle: CircleGeometry): LatLng {
  return { latitude: circle.coordinates[1], longitude: circle.coordinates[0] }
}

/** Throws when a place geometry is not a supported, well-formed circle or polygon. */
export function assertValidGeometry(geometry: PlaceGeometry | null | undefined): asserts geometry is PlaceGeometry {
  if (geometry?.type === 'Point') {
    if (geometry.coordinates?.length === 2 && geometry.radius > 0) {
      return
    }
  } else if (geometry?.type === 'Polygon') {
    if ((geometry.coordinates?.[0]?.length ?? 0) >= 4) {
      return
    }
  }

  throw new Error(`Unsupported or invalid place geometry: ${JSON.stringify(geometry)}`)
}

/** Whether a position lies inside a place geometry (circles get a small `tolerance` factor). */
export function isPointInGeometry(point: LatLng, geometry: PlaceGeometry, tolerance = 1): boolean {
  if (isCircleGeometry(geometry)) {
    return haversineDistance(circleCenter(geometry), point) <= geometry.radius * tolerance
  }

  return isPointInPolygon(point, geometry)
}

/** Random position inside a place geometry (circle or polygon). */
export function randomPointInGeometry(geometry: PlaceGeometry, random: RandomFn = Math.random): LatLng {
  assertValidGeometry(geometry)

  if (isCircleGeometry(geometry)) {
    return randomPointInCircle(circleCenter(geometry), geometry.radius, random)
  }

  const point = randomPointInPolygon(geometry, random)

  if (!point) {
    throw new Error('Could not draw a point inside the polygon')
  }

  return point
}

/** Square bounding box of side `2 · halfSizeMeters` centered on `center`. */
export function boundingBoxAround(center: LatLng, halfSizeMeters: number): BoundingBox {
  const north = destinationPoint(center, halfSizeMeters, 0)
  const east = destinationPoint(center, halfSizeMeters, 90)
  const latitudeDelta = north.latitude - center.latitude
  const longitudeDelta = Math.abs(east.longitude - center.longitude)

  return {
    minLatitude: center.latitude - latitudeDelta,
    minLongitude: center.longitude - longitudeDelta,
    maxLatitude: center.latitude + latitudeDelta,
    maxLongitude: center.longitude + longitudeDelta
  }
}
