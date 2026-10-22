import { create } from 'zustand'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'

/**
 * Store with the stats and streak of the signed-in player: hydrated by the
 * protected layout and refreshed when a game ends (see useRefreshProgress), so
 * the streak of the top bar is always up to date.
 */
interface ProgressState {
  stats: PlayerStats | null
  setStats: (stats: PlayerStats | null) => void
}

export const useProgressStore = create<ProgressState>()((set) => ({
  stats: null,
  setStats: (stats) => set({ stats })
}))
