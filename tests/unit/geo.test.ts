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
