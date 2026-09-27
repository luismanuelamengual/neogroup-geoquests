import { describe, expect, it } from 'vitest'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { pickBestImage } from '@/app/(protected)/(game)/services/locations'

function circlePlace(): Place {
  const place = new Place()

  place.id = 1
  place.geometry = { type: 'Point', coordinates: [0, 0], radius: 5000 }

  return place
}

const target = { latitude: 0, longitude: 0 }

describe('pickBestImage', () => {
  it('prefers panoramas over closer flat images', () => {
    const image = pickBestImage(
      [
        { id: 'flat', latitude: 0.0001, longitude: 0, isPano: false },
        { id: 'pano', latitude: 0.001, longitude: 0, isPano: true }
      ],
      target,
      circlePlace()
    )

    expect(image?.id).toBe('pano')
  })

  it('picks the closest image of the pool', () => {
    const image = pickBestImage(
      [
        { id: 'far', latitude: 0.002, longitude: 0, isPano: false },
        { id: 'near', latitude: 0.0005, longitude: 0, isPano: false }
      ],
      target,
      circlePlace()
    )

    expect(image?.id).toBe('near')
  })

  it('discards images outside the place and excluded ids', () => {
    const images = [
      { id: 'outside', latitude: 1, longitude: 1, isPano: true },
      { id: 'used', latitude: 0, longitude: 0, isPano: true }
    ]

    expect(pickBestImage(images, target, circlePlace(), new Set(['used']))).toBeNull()
  })
})
