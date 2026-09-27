import { describe, expect, it, vi } from 'vitest'
import { MapillaryProvider } from '@/app/(protected)/(game)/services/imagery/MapillaryProvider'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('MapillaryProvider', () => {
  it('queries the Graph API with a bbox and maps the images', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        data: [
          { id: '111', is_pano: true, computed_geometry: { type: 'Point', coordinates: [-58.38, -34.6] } },
          { id: '222', is_pano: false, geometry: { type: 'Point', coordinates: [-58.381, -34.601] } },
          { id: '333' }
        ]
      })
    )
    const provider = new MapillaryProvider('MLY|token', fetchFn as unknown as typeof fetch)
    const images = await provider.findImagesNear({ latitude: -34.6, longitude: -58.38 }, 250)

    expect(images).toEqual([
      { id: '111', latitude: -34.6, longitude: -58.38, isPano: true },
      { id: '222', latitude: -34.601, longitude: -58.381, isPano: false }
    ])

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    const params = new URL(url).searchParams
    const [minLongitude, minLatitude, maxLongitude, maxLatitude] = params.get('bbox')!.split(',').map(Number)

    expect(url.startsWith('https://graph.mapillary.com/images?')).toBe(true)
    expect(minLongitude).toBeLessThan(-58.38)
    expect(maxLongitude).toBeGreaterThan(-58.38)
    expect(minLatitude).toBeLessThan(-34.6)
    expect(maxLatitude).toBeGreaterThan(-34.6)
    // Mapillary limit: bbox area < 0.01 square degrees.
    expect((maxLongitude - minLongitude) * (maxLatitude - minLatitude)).toBeLessThan(0.01)
    expect((init.headers as Record<string, string>).Authorization).toBe('OAuth MLY|token')
  })

  it('throws on HTTP errors', async () => {
    const provider = new MapillaryProvider('MLY|token', (async () => jsonResponse({}, 429)) as unknown as typeof fetch)

    await expect(provider.findImagesNear({ latitude: 0, longitude: 0 }, 250)).rejects.toThrow('429')
  })
})
