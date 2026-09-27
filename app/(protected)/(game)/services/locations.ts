import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import {
  haversineDistance,
  isPointInGeometry,
  RandomFn,
  randomPointInGeometry
} from '@/app/(protected)/(game)/utils/geo'
import { pickRandom } from '@/app/(protected)/(game)/utils/random'

/** Random points tried against the provider before falling back to the cache. */
const MAX_SEARCH_ATTEMPTS = 6
/** Search radius around each random point. */
const SEARCH_RADIUS_METERS = 250
/** Cached locations kept per place: plenty of variety for the fallback, bounded database size. */
export const MAX_CACHED_LOCATIONS_PER_PLACE = 100

export interface FindLocationOptions {
  random?: RandomFn
  /** Image ids that must not be returned (e.g. already used in the same game). */
  excludeImageIds?: Set<string>
}

/**
 * Picks the best image of a batch for the random `target`: 360° panoramas
 * first, then the closest one to the target. Images outside the place area
 * (possible near a polygon edge) or excluded are discarded.
 */
export function pickBestImage(
  images: StreetImage[],
  target: LatLng,
  place: Place,
  excludeImageIds: Set<string> = new Set()
): StreetImage | null {
  // Small tolerance for circles: the search box around a point close to the
  // edge can return images slightly outside it.
  const candidates = images.filter(
    (image) => !excludeImageIds.has(image.id) && isPointInGeometry(image, place.geometry, 1.05)
  )
  const panoramas = candidates.filter((image) => image.isPano)
  const pool = panoramas.length > 0 ? panoramas : candidates

  return (
    pool
      .map((image) => ({ image, distance: haversineDistance(target, image) }))
      .sort((a, b) => a.distance - b.distance)[0]?.image ?? null
  )
}

/**
 * Stores a found image in the place cache (ignored if it was already there),
 * up to MAX_CACHED_LOCATIONS_PER_PLACE locations per place.
 */
async function cacheLocation(place: Place, image: StreetImage): Promise<void> {
  try {
    if ((await PlaceLocation.where('placeId', place.id).count()) >= MAX_CACHED_LOCATIONS_PER_PLACE) {
      return
    }

    await PlaceLocation.upsert(
      [
        {
          placeId: place.id,
          imageId: image.id,
          latitude: image.latitude,
          longitude: image.longitude,
          isPano: image.isPano
        }
      ],
      'imageId',
      ['latitude', 'longitude', 'isPano']
    )
  } catch (error) {
    // The cache is an optimization: never fail a game because of it.
    // eslint-disable-next-line no-console
    console.warn('[locations] Could not cache location', error)
  }
}

/** A random, previously found location of the place (or null when the cache is empty). */
async function findCachedLocation(place: Place, options: FindLocationOptions): Promise<StreetImage | null> {
  const cached = await PlaceLocation.where('placeId', place.id).get()
  const available = cached.filter((location) => !options.excludeImageIds?.has(location.imageId))
  const location = pickRandom(available, options.random)

  return location
    ? { id: location.imageId, latitude: location.latitude, longitude: location.longitude, isPano: location.isPano }
    : null
}

/**
 * Finds a random street-level location inside a place:
 *
 *   1. draws a random point inside the place geometry (circle or polygon),
 *   2. asks the imagery provider for images around it and keeps the best one,
 *   3. retries with a new random point up to MAX_SEARCH_ATTEMPTS times,
 *   4. falls back to a location found in a previous game (place_locations cache).
 *
 * Returns null when the place has no coverage at all.
 */
export async function findRandomLocation(
  place: Place,
  provider: StreetImageryProvider,
  options: FindLocationOptions = {}
): Promise<StreetImage | null> {
  for (let attempt = 0; attempt < MAX_SEARCH_ATTEMPTS; attempt++) {
    const target = randomPointInGeometry(place.geometry, options.random)

    try {
      const images = await provider.findImagesNear(target, SEARCH_RADIUS_METERS)
      const image = pickBestImage(images, target, place, options.excludeImageIds)

      if (image) {
        await cacheLocation(place, image)

        return image
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[locations] ${provider.name} search failed for place ${place.id}`, error)
      // A failing provider will most likely keep failing: go to the cache.
      break
    }
  }

  return findCachedLocation(place, options)
}
