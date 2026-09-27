import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/**
 * Client view of a round. While the round has not been played it only carries
 * the image to show: the real position and the place are revealed (non-null)
 * once the player has guessed, so they never reach the browser beforehand.
 */
export interface RoundView {
  roundNumber: number
  imageId: string
  guessed: boolean
  placeName: string | null
  countryCode: string | null
  location: LatLng | null
  guess: LatLng | null
  distanceMeters: number | null
  score: number | null
}

/** Client view of a game (see RoundView for what is hidden while playing). */
export interface GameView {
  id: number
  mode: GameMode
  status: GameStatus
  roundsCount: number
  totalScore: number
  maxScore: number
  /** Round the player has to guess next; null when the game is finished. */
  currentRoundNumber: number | null
  createdAt: string
  finishedAt: string | null
  rounds: RoundView[]
}

/** Row of the "recent games" list. */
export interface GameListItem {
  id: number
  mode: GameMode
  status: GameStatus
  roundsCount: number
  playedRounds: number
  totalScore: number
  maxScore: number
  createdAt: string
}
