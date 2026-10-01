import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { ApiException } from '@/app/models/ApiException'

const METADATA_API_URL = 'https://maps.googleapis.com/maps/api/streetview/metadata'
const REQUEST_TIMEOUT_MS = 8000

/** A Google Street View panorama: its id (what the embed viewer needs) and exact position. */
export interface Panorama extends LatLng {
  id: string
}

/** Finds the nearest Street View panorama to a point (injectable, so the game logic is testable). */
export interface PanoramaFinder {
  /** The nearest panorama within `radiusMeters` of `point`, or null when there is none. Throws on API errors. */
  findNear(point: LatLng, radiusMeters: number): Promise<Panorama | null>
}

interface MetadataResponse {
  status: string
  pano_id?: string
  location?: { lat: number; lng: number }
  error_message?: string
}

/**
 * Google Street View Image Metadata API — documented by Google as "available
 * at no charge, no quota consumed". Returns the closest outdoor panorama
 * (Google's own imagery, no user photo spheres) within a radius.
 * Needs a server API key (GOOGLE_MAPS_API_KEY).
 *
 * The panorama itself is shown in the browser with the Maps Embed API (free,
 * unlimited) — see components/StreetView.
 */
export class GoogleStreetViewFinder implements PanoramaFinder {
  constructor(
    private readonly apiKey: string,
    private readonly fetchFn: typeof fetch = fetch
  ) {}

  async findNear(point: LatLng, radiusMeters: number): Promise<Panorama | null> {
    const params = new URLSearchParams({
      location: `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`,
      radius: String(Math.round(radiusMeters)),
      source: 'outdoor',
      key: this.apiKey
    })
    const response = await this.fetchFn(`${METADATA_API_URL}?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Street View metadata request failed with status ${response.status}`)
    }

    const body = (await response.json()) as MetadataResponse

    if (body.status === 'ZERO_RESULTS' || body.status === 'NOT_FOUND') {
      return null
    }

    if (body.status !== 'OK' || !body.pano_id || !body.location) {
      // REQUEST_DENIED (bad key / API not enabled), OVER_QUERY_LIMIT, etc.
      throw new Error(`Street View metadata error: ${body.status} ${body.error_message ?? ''}`.trim())
    }

    return { id: body.pano_id, latitude: body.location.lat, longitude: body.location.lng }
  }
}

let finder: PanoramaFinder | null = null

/** The Google Street View finder of this deploy. */
export function getPanoramaFinder(): PanoramaFinder {
  if (!finder) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new ApiException('errors.missingMapsApiKey', 500)
    }

    finder = new GoogleStreetViewFinder(apiKey)
  }

  return finder
}
