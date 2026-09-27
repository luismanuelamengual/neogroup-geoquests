import { create } from 'zustand'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** Phase of the play screen: looking at the image / placing the pin, or watching the round result. */
export type PlayPhase = 'guessing' | 'result'

interface GameState {
  game: GameView | null
  phase: PlayPhase
  /** Pin placed by the player on the guess map for the current round. */
  guess: LatLng | null
  /** Round whose result is being shown (phase "result"). */
  resultRoundNumber: number | null
  setGame: (game: GameView | null) => void
  setGuess: (guess: LatLng | null) => void
  showResult: (game: GameView, roundNumber: number) => void
  nextRound: () => void
  reset: () => void
}

/**
 * State of the game being played. Shared by the play screen components (HUD,
 * guess panel, result overlay) so none of them needs prop drilling.
 */
export const useGameStore = create<GameState>()((set) => ({
  game: null,
  phase: 'guessing',
  guess: null,
  resultRoundNumber: null,
  setGame: (game) => set({ game, phase: 'guessing', guess: null, resultRoundNumber: null }),
  setGuess: (guess) => set({ guess }),
  showResult: (game, roundNumber) => set({ game, phase: 'result', resultRoundNumber: roundNumber }),
  nextRound: () => set({ phase: 'guessing', guess: null, resultRoundNumber: null }),
  reset: () => set({ game: null, phase: 'guessing', guess: null, resultRoundNumber: null })
}))
