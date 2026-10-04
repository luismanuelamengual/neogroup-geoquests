import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** How much a flight arc bends: the bulge, as a fraction of the distance between its ends (on the map). */
const ARC_BEND = 0.22

/**
 * Points ([longitude, latitude]) of a flight arc between two places, as drawn
 * on a flat map: a curve that bends northwards, like the flight routes of an
 * airline map (a real great circle may go over a pole and out of the view).
 * By default it takes the shortest way in longitude: the longitudes are
 * unwrapped (they may go past ±180), so a route crossing the antimeridian is
 * drawn straight across it instead of around the world. With `shortest` off
 * the longitudes are used as given (already unwrapped by the caller).
 */
export function greatCircleArc(from: LatLng, to: LatLng, steps = 64, shortest = true): [number, number][] {
  let toLongitude = to.longitude

  while (shortest && toLongitude - from.longitude > 180) {
    toLongitude -= 360
  }

  while (shortest && toLongitude - from.longitude < -180) {
    toLongitude += 360
  }

  const dx = toLongitude - from.longitude
  const dy = to.latitude - from.latitude
  const length = Math.hypot(dx, dy)
  // Normal of the segment, pointing north (or east when the segment is vertical).
  let nx = length > 0 ? -dy / length : 0
  let ny = length > 0 ? dx / length : 0

  if (ny < 0 || (ny === 0 && nx < 0)) {
    nx = -nx
    ny = -ny
  }

  const controlX = (from.longitude + toLongitude) / 2 + nx * length * ARC_BEND
  const controlY = Math.max(-80, Math.min(80, (from.latitude + to.latitude) / 2 + ny * length * ARC_BEND))
  const points: [number, number][] = []

  for (let step = 0; step <= steps; step++) {
    const t = step / steps
    const a = (1 - t) * (1 - t)
    const b = 2 * (1 - t) * t
    const c = t * t

    points.push([
      a * from.longitude + b * controlX + c * toLongitude,
      a * from.latitude + b * controlY + c * to.latitude
    ])
  }

  return points
}

/**
 * Reference longitude of a set of places: the center of the narrowest band of
 * longitudes that covers all of them (the band leaves out the widest gap
 * between places, e.g. the Pacific for a route through America and Asia).
 * Every longitude of a map is unwrapped around it (see unwrapLongitude), so
 * the places are drawn together, as far from the edges of the world as possible.
 */
export function referenceLongitude(points: LatLng[]): number {
  if (points.length === 0) {
    return 0
  }

  const longitudes = points.map((point) => unwrapLongitude(point.longitude, 0)).sort((a, b) => a - b)
  let widestGap = -1
  let start = longitudes[0]

  for (let index = 0; index < longitudes.length; index++) {
    const next = index + 1 < longitudes.length ? longitudes[index + 1] : longitudes[0] + 360
    const gap = next - longitudes[index]

    if (gap > widestGap) {
      widestGap = gap
      start = next
    }
  }

  return unwrapLongitude(start + (360 - widestGap) / 2, 0)
}

/** A longitude moved by whole turns to within 180° of `reference`: every place of a map in the same copy of the world. */
export function unwrapLongitude(longitude: number, reference: number): number {
  let result = longitude

  while (result - reference > 180) {
    result -= 360
  }

  while (result - reference < -180) {
    result += 360
  }

  return result
}
