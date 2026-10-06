import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import { DetectiveLineup } from '@/app/(protected)/(game)/models/DetectiveLineup'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { isCircleGeometry } from '@/app/(protected)/(game)/models/PlaceGeometry'
import { WITNESS_ROLES } from '@/app/(protected)/(game)/models/WitnessRole'
import { findCachedLocation, findLiveLocation } from '@/app/(protected)/(game)/services/locations'
import { Panorama, PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { computeTimeLimitMinutes, distanceKm } from '@/app/(protected)/(game)/utils/detective'
import { circleCenter, polygonBoundingBox, RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { hasLandmarkClues, pickClueIndices } from '@/app/(protected)/(game)/utils/landmarkClues'
import { pickRandom, shuffle } from '@/app/(protected)/(game)/utils/random'
import { planLineup } from '@/app/(protected)/(game)/utils/suspects'
import { ApiException } from '@/app/models/ApiException'

/** Routes tried before giving up when some of their places have no Street View imagery. */
export const MAX_ROUTE_ATTEMPTS = 4
/** A new detective case: the route of the thief, its stages, the suspects of the last stop and the time available. */
export interface PlannedCase {
  origin: DetectiveStop
  stages: DetectiveStage[]
  lineup: DetectiveLineup
  timeLimitMinutes: number
}

/** Center of a place (circles: their center; polygons: the center of their bounding box). */
export function getPlaceCenter(place: Place): LatLng {
  if (isCircleGeometry(place.geometry)) {
    return circleCenter(place.geometry)
  }

  const box = polygonBoundingBox(place.geometry)

  return { latitude: (box.minLatitude + box.maxLatitude) / 2, longitude: (box.minLongitude + box.maxLongitude) / 2 }
}

function toDetectivePlace(place: Place): DetectivePlace {
  return { placeId: place.id, placeName: place.name, countryCode: place.countryCode, ...getPlaceCenter(place) }
}

/**
 * Chooses the places of a route: a crime scene (any place) and `hops`
 * destinations with clues, each at least `minHopKm` from the previous one and,
 * while possible, every one in a different country (relaxed to "not the
 * country of the previous one", and then to any distance, when the map runs
 * out of options). Null when there are not enough places.
 */
export function chooseRoute(
  places: Place[],
  settings: DetectiveGameSettings,
  random: RandomFn = Math.random,
  excludedPlaceIds: Set<number> = new Set()
): Place[] | null {
  const available = places.filter((place) => !excludedPlaceIds.has(place.id))
  const origin = pickRandom(available, random)

  if (!origin) {
    return null
  }

  const route = [origin]
  const candidates = available.filter((place) => hasLandmarkClues(place.name))

  while (route.length <= settings.hops) {
    const previous = route[route.length - 1]
    const usedIds = new Set(route.map((place) => place.id))
    const usedCountries = new Set(route.map((place) => place.countryCode))
    const unused = candidates.filter((place) => !usedIds.has(place.id))
    const farEnough = (place: Place) => distanceKm(getPlaceCenter(previous), getPlaceCenter(place)) >= settings.minHopKm
    const filters: ((place: Place) => boolean)[] = [
      (place) => farEnough(place) && !usedCountries.has(place.countryCode),
      (place) => farEnough(place) && place.countryCode !== previous.countryCode,
      (place) => place.countryCode !== previous.countryCode,
      () => true
    ]
    let next: Place | undefined

    for (const filter of filters) {
      next = pickRandom(unused.filter(filter), random)

      if (next) {
        break
      }
    }

    if (!next) {
      return null
    }

    route.push(next)
  }

  return route
}

/**
 * `count` decoys for a stage: places not in the route, each in a different
 * country (and none in the country of the right destination, so the clues
 * always tell them apart), about as far from where the detective is as the
 * right destination (see DetectiveDifficultySettings.decoyDistanceBands).
 */
export function chooseDecoys(
  places: Place[],
  from: Place,
  destination: Place,
  routeIds: Set<number>,
  count: number,
  distanceBands: [number, number][],
  random: RandomFn = Math.random
): Place[] {
  const target = distanceKm(getPlaceCenter(from), getPlaceCenter(destination))
  const pool = places.filter(
    (place) =>
      !routeIds.has(place.id) && place.countryCode !== destination.countryCode && place.countryCode !== from.countryCode
  )
  const decoys: Place[] = []

  for (const [min, max] of distanceBands) {
    const band = shuffle(
      pool.filter((place) => {
        const distance = distanceKm(getPlaceCenter(from), getPlaceCenter(place))

        return distance >= target * min && distance <= target * max
      }),
      random
    )

    for (const place of band) {
      if (decoys.length >= count) {
        return decoys
      }

      if (!decoys.some((decoy) => decoy.id === place.id || decoy.countryCode === place.countryCode)) {
        decoys.push(place)
      }
    }
  }

  return decoys
}

/** A Street View panorama inside a place: a live one, or else one from the fallback cache. */
async function findPanorama(
  place: Place,
  finder: PanoramaFinder,
  random: RandomFn,
  excludePanoIds: Set<string>
): Promise<Panorama | null> {
  const { panorama } = await findLiveLocation(place, finder, { random, excludePanoIds })

  return panorama ?? (await findCachedLocation(place, { random, excludePanoIds }))
}

/**
 * Plans a new detective case in a map: the route of the suspect (see
 * chooseRoute) with a Street View panorama at every stop — a place without
 * imagery is replaced by another route — and, for every stage, the decoys,
 * the witnesses (each one with a different clue of the destination, and one of
 * them also with a trait of the thief, see utils/suspects.ts), the suspects of
 * the last stop and, from all that, the time available.
 */
export async function planDetectiveCase(
  places: Place[],
  settings: DetectiveGameSettings,
  finder: PanoramaFinder,
  random: RandomFn = Math.random
): Promise<PlannedCase> {
  if (places.filter((place) => hasLandmarkClues(place.name)).length < settings.hops) {
    throw new ApiException('errors.noPlacesLoaded')
  }

  const panoramas = new Map<number, Panorama>()
  const withoutImagery = new Set<number>()
  let route: Place[] | null = null

  for (let attempt = 0; attempt < MAX_ROUTE_ATTEMPTS && !route; attempt++) {
    const candidate = chooseRoute(places, settings, random, withoutImagery)

    if (!candidate) {
      break
    }

    const usedPanoIds = new Set([...panoramas.values()].map((panorama) => panorama.id))
    const missing = candidate.filter((place) => !panoramas.has(place.id))
    const found = await Promise.all(missing.map((place) => findPanorama(place, finder, random, usedPanoIds)))

    missing.forEach((place, index) => {
      const panorama = found[index]

      if (panorama) {
        panoramas.set(place.id, panorama)
      } else {
        withoutImagery.add(place.id)
      }
    })

    if (candidate.every((place) => panoramas.has(place.id))) {
      route = candidate
    }
  }

  if (!route) {
    throw new ApiException('errors.noImageryFound', 503)
  }

  const stops: DetectiveStop[] = route.map((place) => {
    const panorama = panoramas.get(place.id)!

    return {
      ...toDetectivePlace(place),
      latitude: panorama.latitude,
      longitude: panorama.longitude,
      panoId: panorama.id
    }
  })
  const routeIds = new Set(route.map((place) => place.id))
  const stages: DetectiveStage[] = []
  const hops = []
  // One trait of the thief for every stage: the detective has to remember them to tell it at the end.
  const lineup = planLineup(settings.suspects, route.length - 1, random, {
    traits: settings.suspectTraits,
    decoyContradictions: settings.decoyContradictions
  })

  for (let index = 1; index < route.length; index++) {
    const decoys = chooseDecoys(
      places,
      route[index - 1],
      route[index],
      routeIds,
      settings.options - 1,
      settings.decoyDistanceBands,
      random
    ).map(toDetectivePlace)
    const clues = pickClueIndices(settings.witnesses, random)
    const roles = shuffle(WITNESS_ROLES, random)
    const suspectWitness = Math.floor(random() * settings.witnesses)

    stages.push({
      destination: stops[index],
      options: shuffle([toDetectivePlace(route[index]), ...decoys], random),
      witnesses: clues.map((clueIndex, witness) => ({
        seed: Math.floor(random() * 2 ** 31),
        role: roles[witness % roles.length],
        clueIndex,
        suspectClue: witness === suspectWitness ? lineup.clues[index - 1] : null
      })),
      askedWitnesses: [],
      travel: null
    })
    hops.push({ from: stops[index - 1], to: stops[index], decoys })
  }

  return {
    origin: stops[0],
    stages,
    lineup: { seeds: lineup.seeds, thief: lineup.thief, accused: null },
    timeLimitMinutes: computeTimeLimitMinutes(hops, settings)
  }
}
