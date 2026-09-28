import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/**
 * Client view of a round. While the round has not been played it only carries
 * the panorama to show: the real position and the place are revealed (non-null)
 * once the player has guessed, so they never reach the browser beforehand.
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

/** Client view of a game (see RoundView for what is hidden while playing). */
export interface GameView {
  id: number
  questId: number
  questName: string
  status: GameStatus
  roundsCount: number
  totalScore: number
  maxScore: number
  /** Round the player has to guess next; null when the game is finished. */
  currentRoundNumber: number | null
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds: number | null
  /**
   * Time left (ms) to guess the current round, as measured by the server when
   * it answered. Null when there is no limit or the round was not started yet.
   */
  roundTimeLeftMs: number | null
  createdAt: string
  finishedAt: string | null
  rounds: RoundView[]
}

/** Response of /api/startGame, /api/getGame and /api/submitGuess. */
export interface GameSession {
  game: GameView
  /** Encrypted game state: sent back with every request of this game. */
  token: string
}

/** Row of the "recent games" list (and summary of a game whose details are gone). */
export interface GameListItem {
  id: number
  questId: number
  questName: string
  status: GameStatus
  roundsCount: number
  playedRounds: number
  totalScore: number
  maxScore: number
  createdAt: string
}

/** A page of the player's games ("Mis partidas"). */
export interface GamesPage {
  items: GameListItem[]
  hasMore: boolean
}
