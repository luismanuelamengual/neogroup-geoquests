import type { PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'

/** Optional dependencies of the game services (tests inject fakes); see GameContext. */
export interface GameOptions {
  /** Current time. */
  now?: () => Date
  random?: RandomFn
  /** Street View search. */
  finder?: PanoramaFinder
}
