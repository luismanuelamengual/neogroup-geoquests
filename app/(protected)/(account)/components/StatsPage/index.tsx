'use client'

import './index.scss'
import PlayerStatsPanel from '@/app/(protected)/(account)/components/PlayerStatsPanel'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'

/** "Estadísticas" page (/stats, from the player's menu): the stats of all the player's games and its streak. */
export default function StatsPage({ stats }: { stats: PlayerStats }) {
  return (
    <div className="stats-page">
      <PlayerStatsPanel stats={stats} />
      <AdSlot />
    </div>
  )
}
