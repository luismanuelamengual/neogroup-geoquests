import { MapShape } from '@/app/(protected)/(game)/models/MapShape'
import { isCircleGeometry, PlaceGeometry } from '@/app/(protected)/(game)/models/PlaceGeometry'

/** Size of the box the shape of a map is drawn in (its SVG view box). */
export const MAP_SHAPE_WIDTH = 200
export const MAP_SHAPE_HEIGHT = 100

/** Space left around the shape inside the box. */
const PADDING_X = 14
const PADDING_Y = 16
/** More dots than these are not worth drawing: the places are sampled evenly. */
const MAX_DOTS = 240

type Position = [number, number]

/** Representative position of a geometry: the center of a circle, the average of the vertices of a polygon. */
function centerOf(geometry: PlaceGeometry): Position {
  if (isCircleGeometry(geometry)) {
    return geometry.coordinates
  }

  const ring = geometry.coordinates[0].slice(0, -1)

  return [
    ring.reduce((sum, position) => sum + position[0], 0) / ring.length,
    ring.reduce((sum, position) => sum + position[1], 0) / ring.length
  ]
}

const round = (value: number) => Math.round(value * 10) / 10

/**
 * Projection of [longitude, latitude] positions into the shape box: equirectangular
 * (longitude shrunk by the cosine of the middle latitude, so countries keep
 * their proportions), scaled to fit the box and centered in it.
 */
function projectionOf(positions: Position[]): (position: Position) => Position {
  const longitudes = positions.map((position) => position[0])
  const latitudes = positions.map((position) => position[1])
  const minLongitude = Math.min(...longitudes)
  const maxLatitude = Math.max(...latitudes)
  const middleLatitude = (maxLatitude + Math.min(...latitudes)) / 2
  const stretch = Math.cos((middleLatitude * Math.PI) / 180)
  const width = (Math.max(...longitudes) - minLongitude) * stretch
  const height = maxLatitude - Math.min(...latitudes)
  const scale = Math.min(
    width > 0 ? (MAP_SHAPE_WIDTH - 2 * PADDING_X) / width : Infinity,
    height > 0 ? (MAP_SHAPE_HEIGHT - 2 * PADDING_Y) / height : Infinity
  )
  const factor = Number.isFinite(scale) ? scale : 1
  const offsetX = (MAP_SHAPE_WIDTH - width * factor) / 2
  const offsetY = (MAP_SHAPE_HEIGHT - height * factor) / 2

  return ([longitude, latitude]) => [
    round(offsetX + (longitude - minLongitude) * stretch * factor),
    round(offsetY + (maxLatitude - latitude) * factor)
  ]
}

/**
 * Shape that identifies a map in its card: the silhouette of its area when it
 * is a single polygon (a country), otherwise one dot per place. Null when the
 * map has no places.
 */
export function buildMapShape(geometries: PlaceGeometry[]): MapShape | null {
  if (geometries.length === 0) {
    return null
  }

  if (geometries.length === 1 && !isCircleGeometry(geometries[0])) {
    const ring = geometries[0].coordinates[0] as Position[]
    const project = projectionOf(ring)
    const points = ring.slice(0, -1).map(project)

    return { kind: 'outline', path: `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z` }
  }

  const project = projectionOf(geometries.map(centerOf))
  const unique = new Map<string, Position>()

  for (const geometry of geometries) {
    const dot = project(centerOf(geometry))

    unique.set(`${dot[0]},${dot[1]}`, dot)
  }

  const dots = [...unique.values()]
  const step = Math.max(1, Math.ceil(dots.length / MAX_DOTS))

  return { kind: 'dots', dots: dots.filter((_, index) => index % step === 0) }
}
