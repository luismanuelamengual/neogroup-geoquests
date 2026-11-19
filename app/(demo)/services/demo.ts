import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { findMapBySlug } from '@/app/(protected)/(game)/services/maps'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import { getPanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { ApiException } from '@/app/models/ApiException'

/**
 * Trial game without an account (/demo), for visitors and for the AdSense
 * review. TEMPORARY: the whole module (app/(demo)) can be deleted once it is
 * not needed; see "Partida de prueba" in the README for the few other spots.
 *
 * Nothing is saved: the server only picks the locations and the browser plays
 * the rounds and computes the score by itself.
 */

/** Map of the trial game: the friendliest one. */
export const DEMO_MAP_SLUG = 'famous-cities'

/** Rounds of the trial game. */
export const DEMO_ROUNDS = 3

/** Locations of a new trial game (they include the answers: nothing is at stake). */
export async function getDemoRounds(): Promise<GameRound[]> {
  const map = await findMapBySlug(DEMO_MAP_SLUG)

  if (!map) {
    throw new ApiException('errors.noPlacesLoaded')
  }

  return planGameRounds(map.id, DEMO_ROUNDS, { now: new Date(), random: Math.random, finder: getPanoramaFinder() })
}
