import { create } from 'zustand'
import { GameSession, GameView } from '@/app/(protected)/(game)/models/GameView'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** Phase of the play screen: looking at the image / placing the pin, or watching the round result. */
export type PlayPhase = 'guessing' | 'result'

interface GameState {
  game: GameView | null
  /** Encrypted game token: sent with every guess (see services/gameTokens.ts). */
  token: string | null
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
  setSession: (session: GameSession) => void
  setGuess: (guess: LatLng | null) => void
  showResult: (session: GameSession, roundNumber: number) => void
  nextRound: () => void
  reset: () => void
}

function deadlineOf(game: GameView): number | null {
  return game.roundTimeLeftMs != null ? Date.now() + game.roundTimeLeftMs : null
}

/**
 * State of the game being played. Shared by the play screen components (HUD,
 * timer, guess panel, result overlay) so none of them needs prop drilling.
 */
export const useGameStore = create<GameState>()((set) => ({
  game: null,
  token: null,
  phase: 'guessing',
  guess: null,
  resultRoundNumber: null,
  deadline: null,
  setSession: ({ game, token }) => set({ game, token, deadline: deadlineOf(game) }),
  setGuess: (guess) => set({ guess }),
  showResult: ({ game, token }, roundNumber) =>
    set({ game, token, phase: 'result', resultRoundNumber: roundNumber, deadline: null }),
  nextRound: () => set({ phase: 'guessing', guess: null, resultRoundNumber: null, deadline: null }),
  reset: () => set({ game: null, token: null, phase: 'guessing', guess: null, resultRoundNumber: null, deadline: null })
}))
