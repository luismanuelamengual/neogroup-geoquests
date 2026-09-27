import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import { boundingBoxAround } from '@/app/(protected)/(game)/utils/geo'

const GRAPH_API_URL = 'https://graph.mapillary.com/images'
const REQUEST_TIMEOUT_MS = 8000
/** Mapillary rejects bounding boxes of 0.01 square degrees or more: stay safely below. */
const MAX_BBOX_AREA_SQUARE_DEGREES = 0.009

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
    let box = boundingBoxAround(point, radiusMeters)
    const area = (box.maxLatitude - box.minLatitude) * (box.maxLongitude - box.minLongitude)

    // Shrink big searches (or searches far from the equator, where degrees of
    // longitude get short) to the largest box Mapillary accepts.
    if (area > MAX_BBOX_AREA_SQUARE_DEGREES) {
      box = boundingBoxAround(point, radiusMeters * Math.sqrt(MAX_BBOX_AREA_SQUARE_DEGREES / area))
    }

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
