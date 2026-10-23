'use client'

import './index.scss'
import PlayerLevelPanel from '@/app/(protected)/(account)/components/PlayerLevelPanel'
import PlayerStatsPanel from '@/app/(protected)/(account)/components/PlayerStatsPanel'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'

/**
 * "Mi progreso" page (/progress, from the player's menu): everything the player
 * builds up for good in the app — its level, the stats of all its games and its streak.
 */
export default function ProgressPage({ stats }: { stats: PlayerStats }) {
  return (
    <div className="progress-page">
      <PlayerLevelPanel stats={stats} />
      <PlayerStatsPanel stats={stats} />
      <AdSlot />
    </div>
  )
}
