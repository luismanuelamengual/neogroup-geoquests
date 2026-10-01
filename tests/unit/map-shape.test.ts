import { describe, expect, it } from 'vitest'
import { PlaceGeometry } from '@/app/(protected)/(game)/models/PlaceGeometry'
import { buildMapShape, MAP_SHAPE_HEIGHT, MAP_SHAPE_WIDTH } from '@/app/(protected)/(game)/utils/mapShape'

const circle = (longitude: number, latitude: number): PlaceGeometry => ({
  type: 'Point',
  coordinates: [longitude, latitude],
  radius: 5000
})

describe('map shapes', () => {
  it('has no shape without places', () => {
    expect(buildMapShape([])).toBeNull()
  })

  it('draws the silhouette of a map that is a single polygon', () => {
    const shape = buildMapShape([
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 20],
            [0, 0]
          ]
        ]
      }
    ])

    expect(shape?.kind).toBe('outline')
    expect(shape?.kind === 'outline' && shape.path).toMatch(/^M[\d. L-]+Z$/)
  })

  it('draws a dot per place in the other maps, inside the box', () => {
    const shape = buildMapShape([circle(-58, -34), circle(2, 48), circle(139, 35), circle(-74, 40)])

    expect(shape?.kind).toBe('dots')

    if (shape?.kind === 'dots') {
      expect(shape.dots).toHaveLength(4)

      for (const [x, y] of shape.dots) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(MAP_SHAPE_WIDTH)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(MAP_SHAPE_HEIGHT)
      }
    }
  })

  it('draws a single circle place, and samples maps with too many places', () => {
    expect(buildMapShape([circle(5, 5)])).toEqual({ kind: 'dots', dots: [[100, 50]] })

    const many = Array.from({ length: 600 }, (_, index) =>
      circle((index % 30) * 5 - 75, Math.floor(index / 30) * 3 - 30)
    )
    const shape = buildMapShape(many)

    expect(shape?.kind === 'dots' && shape.dots.length).toBeLessThanOrEqual(240)
  })
})
