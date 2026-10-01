import { MAP_PHOTOS } from '@/app/(protected)/(game)/data/mapPhotos'
import { MapPhoto } from '@/app/(protected)/(game)/models/MapPhoto'

/** Photos of a card are at most these: a collage of more would be too small to see. */
export const MAX_MAP_PHOTOS = 4

/** Slug of a map name, e.g. "Lugares icónicos" -> "lugares-iconicos" (folder of its photos under /public/maps). */
export function mapSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Photos of the collage of a map (empty when it has none). */
export function getMapPhotos(name: string): MapPhoto[] {
  return (MAP_PHOTOS[mapSlug(name)] ?? []).slice(0, MAX_MAP_PHOTOS)
}
