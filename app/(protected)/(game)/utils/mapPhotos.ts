import { MAP_PHOTOS } from '@/app/(protected)/(game)/data/mapPhotos'
import { MapPhoto } from '@/app/(protected)/(game)/models/MapPhoto'

/** Photos of a card are at most these: a collage of more would be too small to see. */
export const MAX_MAP_PHOTOS = 4

/** Photos of the collage of a map (empty when it has none). */
export function getMapPhotos(slug: string): MapPhoto[] {
  return (MAP_PHOTOS[slug] ?? []).slice(0, MAX_MAP_PHOTOS)
}
