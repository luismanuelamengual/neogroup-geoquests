import { describe, expect, it } from 'vitest'
import { CircleGeometry, PolygonGeometry } from '@/app/(protected)/(game)/models/PlaceGeometry'
import {
  boundingBoxAround,
  destinationPoint,
  haversineDistance,
  isPointInGeometry,
  isPointInPolygon,
  randomPointInCircle,
  randomPointInGeometry,
  randomPointInPolygon
} from '@/app/(protected)/(game)/utils/geo'
import { greatCircleArc, referenceLongitude, unwrapLongitude } from '@/app/(protected)/(game)/utils/geoArc'

/** Deterministic pseudo-random generator (mulberry32). */
function seeded(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const BUENOS_AIRES = { latitude: -34.6037, longitude: -58.3816 }
const MADRID = { latitude: 40.4168, longitude: -3.7038 }
const SQUARE: PolygonGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0]
    ]
  ]
}

describe('haversineDistance', () => {
  it('is 0 for the same point', () => {
    expect(haversineDistance(BUENOS_AIRES, BUENOS_AIRES)).toBe(0)
  })

  it('matches the known Buenos Aires – Madrid distance (~10,040 km)', () => {
    expect(haversineDistance(BUENOS_AIRES, MADRID) / 1000).toBeCloseTo(10040, -2)
  })

  it('is symmetric', () => {
    expect(haversineDistance(MADRID, BUENOS_AIRES)).toBeCloseTo(haversineDistance(BUENOS_AIRES, MADRID), 6)
  })
})

describe('destinationPoint', () => {
  it('travels the requested distance', () => {
    const destination = destinationPoint(BUENOS_AIRES, 5000, 73)

    expect(haversineDistance(BUENOS_AIRES, destination)).toBeCloseTo(5000, 3)
  })
})

describe('randomPointInCircle', () => {
  it('always stays inside the radius and covers the whole disc', () => {
    const random = seeded(42)
    const distances = Array.from({ length: 2000 }, () =>
      haversineDistance(BUENOS_AIRES, randomPointInCircle(BUENOS_AIRES, 3000, random))
    )

    expect(Math.max(...distances)).toBeLessThanOrEqual(3000.001)
    // Uniform over the area ⇒ ~75% of the points lie beyond half the radius.
    const outerShare = distances.filter((distance) => distance > 1500).length / distances.length

    expect(outerShare).toBeGreaterThan(0.7)
    expect(outerShare).toBeLessThan(0.8)
  })
})

describe('polygons', () => {
  it('detects points inside and outside', () => {
    expect(isPointInPolygon({ latitude: 0.5, longitude: 0.5 }, SQUARE)).toBe(true)
    expect(isPointInPolygon({ latitude: 1.5, longitude: 0.5 }, SQUARE)).toBe(false)
  })

  it('honours holes', () => {
    const withHole: PolygonGeometry = {
      type: 'Polygon',
      coordinates: [
        SQUARE.coordinates[0],
        [
          [0.4, 0.4],
          [0.6, 0.4],
          [0.6, 0.6],
          [0.4, 0.6],
          [0.4, 0.4]
        ]
      ]
    }

    expect(isPointInPolygon({ latitude: 0.5, longitude: 0.5 }, withHole)).toBe(false)
    expect(isPointInPolygon({ latitude: 0.2, longitude: 0.2 }, withHole)).toBe(true)
  })

  it('draws random points inside the polygon', () => {
    const random = seeded(7)

    for (let i = 0; i < 500; i++) {
      const point = randomPointInPolygon(SQUARE, random)

      expect(point).not.toBeNull()
      expect(isPointInPolygon(point!, SQUARE)).toBe(true)
    }
  })
})

describe('place geometries (GeoJSON)', () => {
  const circle: CircleGeometry = {
    type: 'Point',
    coordinates: [BUENOS_AIRES.longitude, BUENOS_AIRES.latitude],
    radius: 2000
  }

  it('draws random points inside a circle geometry (Point + radius)', () => {
    const random = seeded(3)

    for (let i = 0; i < 300; i++) {
      const point = randomPointInGeometry(circle, random)

      expect(haversineDistance(BUENOS_AIRES, point)).toBeLessThanOrEqual(2000.001)
      expect(isPointInGeometry(point, circle)).toBe(true)
    }
  })

  it('draws random points inside a polygon geometry', () => {
    const random = seeded(5)

    for (let i = 0; i < 300; i++) {
      expect(isPointInGeometry(randomPointInGeometry(SQUARE, random), SQUARE)).toBe(true)
    }
  })

  it('rejects unsupported or malformed geometries', () => {
    expect(() => randomPointInGeometry({ type: 'Point', coordinates: [0, 0], radius: 0 })).toThrow()
    expect(() => randomPointInGeometry({ type: 'LineString', coordinates: [] } as unknown as PolygonGeometry)).toThrow()
  })
})

describe('boundingBoxAround', () => {
  it('builds a box of the requested half size', () => {
    const box = boundingBoxAround(BUENOS_AIRES, 250)
    const north = { latitude: box.maxLatitude, longitude: BUENOS_AIRES.longitude }
    const east = { latitude: BUENOS_AIRES.latitude, longitude: box.maxLongitude }

    expect(haversineDistance(BUENOS_AIRES, north)).toBeCloseTo(250, 1)
    expect(haversineDistance(BUENOS_AIRES, east)).toBeCloseTo(250, 0)
  })
})

describe('flight arc', () => {
  it('goes from one place to the other', () => {
    const arc = greatCircleArc({ latitude: -34.6, longitude: -58.4 }, { latitude: 40.4, longitude: -3.7 }, 10)

    expect(arc).toHaveLength(11)
    expect(arc[0][0]).toBeCloseTo(-58.4)
    expect(arc[0][1]).toBeCloseTo(-34.6)
    expect(arc[10][0]).toBeCloseTo(-3.7)
    expect(arc[10][1]).toBeCloseTo(40.4)
  })

  it('crosses the antimeridian instead of going around the world', () => {
    // Tokyo → Los Angeles: the longitudes keep growing past 180.
    const arc = greatCircleArc({ latitude: 35.7, longitude: 139.7 }, { latitude: 34.1, longitude: -118.2 }, 20)

    for (let index = 1; index < arc.length; index++) {
      expect(Math.abs(arc[index][0] - arc[index - 1][0])).toBeLessThan(20)
    }

    expect(arc[20][0]).toBeCloseTo(-118.2 + 360)
  })

  it('bends northwards', () => {
    const arc = greatCircleArc({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 40 }, 10)

    expect(arc[5][1]).toBeGreaterThan(3)
  })
})

describe('unwrapped longitudes', () => {
  it('puts every place in the same copy of the world', () => {
    const reference = referenceLongitude([
      { latitude: 0, longitude: 170 },
      { latitude: 0, longitude: -170 }
    ])

    expect(Math.abs(reference)).toBeCloseTo(180)
    expect(Math.abs(unwrapLongitude(-170, reference) - unwrapLongitude(170, reference))).toBeCloseTo(20)
    expect(unwrapLongitude(10, 0)).toBe(10)
    expect(unwrapLongitude(350, 0)).toBe(-10)
  })

  it('centers the map on the narrowest band covering every place', () => {
    // America and Asia: the band leaves the Pacific out (it goes through Europe and Africa).
    const longitudes = [-89, -79, -73, -70, -10, 35, 78, 81, 102, 140]
    const reference = referenceLongitude(longitudes.map((longitude) => ({ latitude: 0, longitude })))

    expect(reference).toBeCloseTo(25.5)

    for (const longitude of longitudes) {
      expect(Math.abs(unwrapLongitude(longitude, reference) - reference)).toBeLessThanOrEqual(180)
    }
  })
})
