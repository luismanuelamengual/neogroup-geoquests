import { describe, expect, it, vi } from 'vitest'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { isUsablePanorama } from '@/app/(protected)/(game)/services/locations'
import { GoogleStreetViewFinder } from '@/app/(protected)/(game)/services/streetView'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('GoogleStreetViewFinder', () => {
  it('asks the metadata API for the nearest outdoor panorama', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ status: 'OK', pano_id: 'PANO123', location: { lat: -32.9125, lng: -68.7857 } })
    )
    const finder = new GoogleStreetViewFinder('KEY', fetchFn as unknown as typeof fetch)

    expect(await finder.findNear({ latitude: -32.91, longitude: -68.78 }, 500)).toEqual({
      id: 'PANO123',
      latitude: -32.9125,
      longitude: -68.7857
    })

    const [url] = fetchFn.mock.calls[0] as unknown as [string]
    const params = new URL(url).searchParams

    expect(url.startsWith('https://maps.googleapis.com/maps/api/streetview/metadata?')).toBe(true)
    expect(params.get('location')).toBe('-32.910000,-68.780000')
    expect(params.get('radius')).toBe('500')
    expect(params.get('source')).toBe('outdoor')
    expect(params.get('key')).toBe('KEY')
  })

  it('returns null when there is no panorama around', async () => {
    const finder = new GoogleStreetViewFinder('KEY', (async () =>
      jsonResponse({ status: 'ZERO_RESULTS' })) as unknown as typeof fetch)

    expect(await finder.findNear({ latitude: 0, longitude: 0 }, 250)).toBeNull()
  })

  it('fails on API errors (bad key, quota...)', async () => {
    const finder = new GoogleStreetViewFinder('KEY', (async () =>
      jsonResponse({ status: 'REQUEST_DENIED', error_message: 'API key not valid' })) as unknown as typeof fetch)

    await expect(finder.findNear({ latitude: 0, longitude: 0 }, 250)).rejects.toThrow('REQUEST_DENIED')
  })
})

describe('isUsablePanorama', () => {
  const place = new Place()

  place.id = 1
  place.geometry = { type: 'Point', coordinates: [0, 0], radius: 5000 }

  it('accepts panoramas inside the place geometry', () => {
    expect(isUsablePanorama({ id: 'a', latitude: 0.01, longitude: 0 }, place)).toBe(true)
  })

  it('rejects panoramas outside the place or already used', () => {
    expect(isUsablePanorama({ id: 'a', latitude: 1, longitude: 1 }, place)).toBe(false)
    expect(isUsablePanorama({ id: 'a', latitude: 0, longitude: 0 }, place, new Set(['a']))).toBe(false)
  })
})
