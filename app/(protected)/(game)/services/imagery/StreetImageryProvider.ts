import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** A street-level image found by a provider. */
export interface StreetImage extends LatLng {
  /** Provider-specific id, enough for the client viewer to render the image. */
  id: string
  /** True for 360° panoramas (the best experience for the game). */
  isPano: boolean
}

/**
 * Source of street-level imagery. The game only depends on this interface, so
 * moving from Mapillary (free) to Google Street View (paid) — or mixing both —
 * is a matter of adding an implementation and selecting it in `./index.ts`.
 */
export interface StreetImageryProvider {
  readonly name: string
  /** Images whose position is within ~`radiusMeters` of `point` (any order, possibly empty). */
  findImagesNear(point: LatLng, radiusMeters: number): Promise<StreetImage[]>
}
