import { Place } from '@/app/(protected)/(game)/models/Place'
import type { Panorama } from '@/app/(protected)/(game)/services/streetView'

/** A round chosen for a new game: the place and the panorama found inside it (see services/rounds.ts). */
export interface PlannedRound {
  place: Place
  panorama: Panorama
}
