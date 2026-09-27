import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { Place } from '@/app/(protected)/(game)/models/Place'

/** Enabled places of a game mode. */
export async function getPlaces(mode: GameMode): Promise<Place[]> {
  return Place.where('mode', mode).where('enabled', true).orderBy('id').get()
}
