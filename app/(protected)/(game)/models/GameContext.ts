import type { PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'

/**
 * What a game mode engine gets from the outside world while handling a
 * request: the current time (one fixed instant per request), the random
 * source and the Street View search. Tests inject fakes (see GameOptions).
 */
export interface GameContext {
  now: Date
  random: RandomFn
  finder: PanoramaFinder
}
