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

/**
 * Search radius (meters) of each live attempt: every attempt draws a new random
 * point and looks further around it, so places with patchy coverage (water,
 * parks, outskirts) still end up with a live image almost every time.
 */
export const SEARCH_RADII_METERS = [250, 500, 1000, 2000, 3000, 3000]
/** Locations kept per place in the fallback cache (bounded database size). */
export const MAX_CACHED_LOCATIONS_PER_PLACE = 100

export interface FindLocationOptions {
  random?: RandomFn
  /** Image ids that must not be returned (e.g. already used in the same game). */
  excludeImageIds?: Set<string>
}

export interface LiveSearchResult {
  image: StreetImage | null
  /** True when the provider errored (down, rate limited, timeout) rather than just finding nothing. */
  providerFailed: boolean
}

/**
 * Picks the best image of a batch for the random `target`: 360° panoramas
 * first, then the closest one to the target. Images outside the place
 * geometry (possible near its edge) or excluded are discarded.
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
 * Stores a found image in the fallback cache of its place. Once the place has
 * MAX_CACHED_LOCATIONS_PER_PLACE locations, the new one replaces a random old
 * one: the cache stays small but keeps rotating, so the fallback never becomes
 * a fixed set of spots players could learn by heart.
 */
async function cacheLocation(place: Place, image: StreetImage, random: RandomFn = Math.random): Promise<void> {
  try {
    if (await PlaceLocation.where('imageId', image.id).first()) {
      return
    }

    const count = await PlaceLocation.where('placeId', place.id).count()
    const location =
      count < MAX_CACHED_LOCATIONS_PER_PLACE
        ? new PlaceLocation()
        : await PlaceLocation.where('placeId', place.id)
            .orderBy('id')
            .offset(Math.floor(random() * count))
            .first()

    if (!location) {
      return
    }

    location.placeId = place.id
    location.imageId = image.id
    location.latitude = image.latitude
    location.longitude = image.longitude
    location.isPano = image.isPano
    location.createdAt = new Date()
    await location.save()
  } catch (error) {
    // The cache is an optimization: never fail a game because of it.
    // eslint-disable-next-line no-console
    console.warn('[locations] Could not cache location', error)
  }
}

/**
 * Looks for a live street-level image inside a place: draws a random point
 * inside its geometry, asks the provider for images around it (with a growing
 * radius, see SEARCH_RADII_METERS) and keeps the best one. Every image found
 * is also stored in the fallback cache.
 */
export async function findLiveLocation(
  place: Place,
  provider: StreetImageryProvider,
  options: FindLocationOptions = {}
): Promise<LiveSearchResult> {
  for (const radius of SEARCH_RADII_METERS) {
    const target = randomPointInGeometry(place.geometry, options.random)

    try {
      const images = await provider.findImagesNear(target, radius)
      const image = pickBestImage(images, target, place, options.excludeImageIds)

      if (image) {
        await cacheLocation(place, image, options.random)

        return { image, providerFailed: false }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[locations] ${provider.name} search failed for place ${place.id}`, error)

      // A failing provider will most likely keep failing: stop insisting.
      return { image: null, providerFailed: true }
    }
  }

  return { image: null, providerFailed: false }
}

/**
 * A random location of the place from the fallback cache (null when empty).
 * Last resort only: the game uses it when live searches could not fill a game
 * (see planRounds in services/games.ts), never as a first choice.
 */
export async function findCachedLocation(place: Place, options: FindLocationOptions = {}): Promise<StreetImage | null> {
  const cached = await PlaceLocation.where('placeId', place.id).get()
  const available = cached.filter((location) => !options.excludeImageIds?.has(location.imageId))
  const location = pickRandom(available, options.random)

  return location
    ? { id: location.imageId, latitude: location.latitude, longitude: location.longitude, isPano: location.isPano }
    : null
}
