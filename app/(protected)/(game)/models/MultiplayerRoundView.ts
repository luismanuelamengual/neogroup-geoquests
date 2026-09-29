import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { PlayerGuessView } from '@/app/(protected)/(game)/models/PlayerGuessView'

/**
 * A round of a multiplayer game as the players see it. The answer and
 * everybody's guesses are only revealed (non-null) once the round is closed.
 */
export interface MultiplayerRoundView {
  roundNumber: number
  /** Google Street View panorama to show. */
  panoId: string
  closed: boolean
  placeName: string | null
  countryCode: string | null
  location: LatLng | null
  /** Guesses of every player (closed rounds only), best first. */
  guesses: PlayerGuessView[]
}
