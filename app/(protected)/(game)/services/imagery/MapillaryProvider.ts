import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import { boundingBoxAround } from '@/app/(protected)/(game)/utils/geo'

const GRAPH_API_URL = 'https://graph.mapillary.com/images'
const REQUEST_TIMEOUT_MS = 8000
/** Mapillary rejects bounding boxes larger than 0.01 square degrees. */
const MAX_BBOX_HALF_SIZE_METERS = 500

interface MapillaryPoint {
  type: 'Point'
  coordinates: [number, number]
}

interface MapillaryImage {
  id: string
  is_pano?: boolean
  geometry?: MapillaryPoint
  computed_geometry?: MapillaryPoint
}

/**
 * Mapillary (https://www.mapillary.com) — free, crowd-sourced street-level
 * imagery by Meta, licensed CC BY-SA (attribution is shown by the viewer).
 *
 * Searches the Graph API v4 `images` endpoint inside a small bounding box
 * around the requested point. Requires a client token (MLY|...) in
 * MAPILLARY_ACCESS_TOKEN.
 */
export class MapillaryProvider implements StreetImageryProvider {
  readonly name = 'mapillary'

  constructor(
    private readonly accessToken: string,
    private readonly fetchFn: typeof fetch = fetch
  ) {}

  async findImagesNear(point: LatLng, radiusMeters: number): Promise<StreetImage[]> {
    const box = boundingBoxAround(point, Math.min(radiusMeters, MAX_BBOX_HALF_SIZE_METERS))
    const params = new URLSearchParams({
      fields: 'id,is_pano,geometry,computed_geometry',
      bbox: [box.minLongitude, box.minLatitude, box.maxLongitude, box.maxLatitude].map((n) => n.toFixed(6)).join(','),
      limit: '50'
    })
    const response = await this.fetchFn(`${GRAPH_API_URL}?${params}`, {
      headers: { Authorization: `OAuth ${this.accessToken}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Mapillary request failed with status ${response.status}`)
    }

    const body = (await response.json()) as { data?: MapillaryImage[] }

    return (body.data ?? []).flatMap((image) => {
      // computed_geometry is the position corrected by Mapillary's SfM; fall
      // back to the raw GPS geometry when it's not available.
      const geometry = image.computed_geometry ?? image.geometry

      if (!image.id || !geometry?.coordinates) {
        return []
      }

      const [longitude, latitude] = geometry.coordinates

      return [{ id: String(image.id), latitude, longitude, isPano: !!image.is_pano }]
    })
  }
}
