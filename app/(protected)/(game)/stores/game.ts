import { create } from 'zustand'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** Phase of the play screen: looking at the image / placing the pin, or watching the round result. */
export type PlayPhase = 'guessing' | 'result'

interface GameState {
  /** The game on screen, as last answered by the server. */
  game: GameView | null
  /**
   * When `game` was received (epoch ms, this device's clock): the times left
   * the server reports (countdowns) are relative to this moment.
   */
  receivedAt: number
  phase: PlayPhase
  /** Pin placed by the player on the guess map for the current round. */
  guess: LatLng | null
  /** Round whose result is being shown (phase "result"). */
  resultRoundNumber: number | null
  /**
   * When the current round's time runs out, in this device's clock (epoch ms),
   * derived from the time left the server reported. Null: no time limit (or
   * not started yet).
   */
  deadline: number | null
  /** Replaces the game (e.g. loaded, or its round started) keeping the pin already placed. */
  setGame: (game: GameView, timeLeftMs?: number | null) => void
  setGuess: (guess: LatLng | null) => void
  /** Shows the result of a round (after a guess). */
  showResult: (game: GameView, roundNumber: number) => void
  /** Closes the result of a round: back to guessing (the next round, or the summary once the game is over). */
  closeResult: () => void
  reset: () => void
}

/**
 * State of the game being played. Shared by the play screen components (HUD,
 * timer, guess panel, result overlay) so none of them needs prop drilling.
 */
export const useGameStore = create<GameState>()((set) => ({
  game: null,
  receivedAt: 0,
  phase: 'guessing',
  guess: null,
  resultRoundNumber: null,
  deadline: null,
  setGame: (game, timeLeftMs = null) =>
    set({ game, receivedAt: Date.now(), deadline: timeLeftMs != null ? Date.now() + timeLeftMs : null }),
  setGuess: (guess) => set({ guess }),
  showResult: (game, roundNumber) =>
    set({ game, receivedAt: Date.now(), phase: 'result', resultRoundNumber: roundNumber, deadline: null }),
  closeResult: () => set({ phase: 'guessing', guess: null, resultRoundNumber: null, deadline: null }),
  reset: () =>
    set({ game: null, receivedAt: 0, phase: 'guessing', guess: null, resultRoundNumber: null, deadline: null })
}))
