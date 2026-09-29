import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/**
 * Client view of a round. While the round has not been played it only carries
 * the panorama to show: the real position and the place are revealed (non-null)
 * once the round was played, so they never reach the browser beforehand.
 */
export interface RoundView {
  roundNumber: number
  /** Google Street View panorama to show. */
  panoId: string
  guessed: boolean
  placeName: string | null
  countryCode: string | null
  location: LatLng | null
  guess: LatLng | null
  distanceMeters: number | null
  score: number | null
  /** True when the time ran out before the player guessed (the round scores 0). */
  timedOut: boolean
}
