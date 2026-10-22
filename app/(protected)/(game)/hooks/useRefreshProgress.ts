'use client'

import { useEffect } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useProgressStore } from '@/app/(protected)/stores/progress'

/** Reloads the stats and streak of the player when `active` becomes true (e.g. a game just ended). */
export function useRefreshProgress(active: boolean): void {
  const { getPlayerStats } = useGames()
  const setStats = useProgressStore((state) => state.setStats)

  useEffect(() => {
    if (!active) {
      return
    }

    getPlayerStats()
      .then(setStats)
      .catch(() => {
        // Not important: the streak is refreshed on the next page load.
      })
  }, [active, getPlayerStats, setStats])
}
