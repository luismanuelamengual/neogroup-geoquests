import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlaceLocation } from '@/app/(protected)/(game)/models/PlaceLocation'
import { Panorama, PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { isPointInGeometry, RandomFn, randomPointInGeometry } from '@/app/(protected)/(game)/utils/geo'
import { pickRandom } from '@/app/(protected)/(game)/utils/random'

/**
 * Search radius (meters) of each live attempt: every attempt draws a new random
 * point and looks further around it, so places with patchy coverage (water,
 * parks, outskirts) still end up with a live panorama almost every time.
 */
export const SEARCH_RADII_METERS = [250, 500, 1000, 2000, 3000, 3000]
/** Locations kept per place in the fallback cache (bounded database size). */
export const MAX_CACHED_LOCATIONS_PER_PLACE = 100

export interface FindLocationOptions {
  random?: RandomFn
  /** Panorama ids that must not be returned (e.g. already used in the same game). */
  excludePanoIds?: Set<string>
}

export interface LiveSearchResult {
  panorama: Panorama | null
  /** True when Street View errored (down, bad key, rate limited, timeout) rather than just finding nothing. */
  failed: boolean
}

/**
 * Whether a panorama found for a place can be used: inside the place geometry
 * (small tolerance for circles: a search around a point close to the edge can
 * return a panorama slightly outside it) and not excluded.
 */
export function isUsablePanorama(panorama: Panorama, place: Place, excludePanoIds: Set<string> = new Set()): boolean {
  return !excludePanoIds.has(panorama.id) && isPointInGeometry(panorama, place.geometry, 1.05)
}

/**
 * Stores a found panorama in the fallback cache of its place. Once the place
 * has MAX_CACHED_LOCATIONS_PER_PLACE locations, the new one replaces a random
 * old one: the cache stays small but keeps rotating, so the fallback never
 * becomes a fixed set of spots players could learn by heart.
 */
async function cacheLocation(place: Place, panorama: Panorama, random: RandomFn = Math.random): Promise<void> {
  try {
    if (await PlaceLocation.where('panoId', panorama.id).first()) {
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
    location.panoId = panorama.id
    location.latitude = panorama.latitude
    location.longitude = panorama.longitude
    location.createdAt = new Date()
    await location.save()
  } catch (error) {
    // The cache is an optimization: never fail a game because of it.
    // eslint-disable-next-line no-console
    console.warn('[locations] Could not cache location', error)
  }
}

/**
 * Looks for a live Street View panorama inside a place: draws a random point
 * inside its geometry, asks Street View for the nearest panorama (with a
 * growing radius, see SEARCH_RADII_METERS) and keeps it if it is usable. Every
 * panorama found is also stored in the fallback cache.
 */
export async function findLiveLocation(
  place: Place,
  finder: PanoramaFinder,
  options: FindLocationOptions = {}
): Promise<LiveSearchResult> {
  for (const radius of SEARCH_RADII_METERS) {
    const target = randomPointInGeometry(place.geometry, options.random)

    try {
      const panorama = await finder.findNear(target, radius)

      if (panorama && isUsablePanorama(panorama, place, options.excludePanoIds)) {
        await cacheLocation(place, panorama, options.random)

        return { panorama, failed: false }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[locations] Street View search failed for place ${place.id}`, error)

      // A failing service will most likely keep failing: stop insisting.
      return { panorama: null, failed: true }
    }
  }

  return { panorama: null, failed: false }
}

/**
 * A random location of the place from the fallback cache (null when empty).
 * Last resort only: the game uses it when live searches could not fill a game
 * (see planRounds in services/games.ts), never as a first choice.
 */
export async function findCachedLocation(place: Place, options: FindLocationOptions = {}): Promise<Panorama | null> {
  const cached = await PlaceLocation.where('placeId', place.id).get()
  const available = cached.filter((location) => !options.excludePanoIds?.has(location.panoId))
  const location = pickRandom(available, options.random)

  return location ? { id: location.panoId, latitude: location.latitude, longitude: location.longitude } : null
}
