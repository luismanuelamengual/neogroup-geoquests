import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlannedRound } from '@/app/(protected)/(game)/models/PlannedRound'
import { findCachedLocation, findLiveLocation } from '@/app/(protected)/(game)/services/locations'
import { getMapPlaces } from '@/app/(protected)/(game)/services/maps'
import { PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { ApiException } from '@/app/models/ApiException'

/**
 * Chooses the places and locations of the rounds of a new game.
 *
 *   1. Live panoramas only: places are shuffled and consumed in order (so
 *      every round is in a different place while the map has enough of
 *      them); a place where no live panorama is found is skipped for another.
 *      Searches run in parallel, one per round, to keep the wait short.
 *   2. Only if that could not fill the game (in practice: Street View is
 *      failing), the missing rounds come from the fallback cache — preferably
 *      from places not used yet.
 */
export async function planRounds(
  places: Place[],
  roundsCount: number,
  finder: PanoramaFinder,
  random?: RandomFn
): Promise<PlannedRound[]> {
  const queue: Place[] = []

  while (queue.length < roundsCount * 2) {
    queue.push(...shuffle(places, random))
  }

  const usedPanoIds = new Set<string>()

  const findLiveForSlot = async (): Promise<PlannedRound | null> => {
    while (queue.length > 0) {
      const place = queue.shift()!
      const { panorama } = await findLiveLocation(place, finder, { random, excludePanoIds: usedPanoIds })

      if (panorama && !usedPanoIds.has(panorama.id)) {
        usedPanoIds.add(panorama.id)

        return { place, panorama }
      }
    }

    return null
  }

  const planned = (await Promise.all(Array.from({ length: roundsCount }, findLiveForSlot))).filter(
    (round): round is PlannedRound => round !== null
  )

  if (planned.length < roundsCount) {
    const usedPlaceIds = new Set(planned.map((round) => round.place.id))
    const fallbackPlaces = [
      ...shuffle(
        places.filter((place) => !usedPlaceIds.has(place.id)),
        random
      ),
      ...shuffle(places, random)
    ]

    for (const place of fallbackPlaces) {
      if (planned.length >= roundsCount) {
        break
      }

      const panorama = await findCachedLocation(place, { random, excludePanoIds: usedPanoIds })

      if (panorama) {
        usedPanoIds.add(panorama.id)
        planned.push({ place, panorama })
      }
    }
  }

  return planned
}

/**
 * The rounds of a new game in a map: `roundsCount` locations drawn from the
 * map's places (see planRounds). Throws when the map has no places or not
 * enough imagery could be found.
 */
export async function planGameRounds(mapId: number, roundsCount: number, ctx: GameContext): Promise<GameRound[]> {
  const places = await getMapPlaces(mapId)

  if (places.length === 0) {
    throw new ApiException('Este modo de juego todavía no tiene lugares cargados')
  }

  const planned = await planRounds(places, roundsCount, ctx.finder, ctx.random)

  if (planned.length < roundsCount) {
    throw new ApiException('No pudimos encontrar imágenes para armar la partida. Intentá de nuevo en un momento.', 503)
  }

  return planned.map(({ place, panorama }) => ({
    placeName: place.name,
    countryCode: place.countryCode,
    panoId: panorama.id,
    latitude: panorama.latitude,
    longitude: panorama.longitude
  }))
}
