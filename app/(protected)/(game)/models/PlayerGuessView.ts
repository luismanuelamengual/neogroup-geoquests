import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** A player's guess for a closed round, as shown to everybody. */
export interface PlayerGuessView {
  userId: number
  /** Null when the player did not guess in time. */
  guess: LatLng | null
  distanceMeters: number | null
  score: number
  timedOut: boolean
}
