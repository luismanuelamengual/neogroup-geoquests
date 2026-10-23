'use client'

import './index.scss'
import AchievementsPanel from '@/app/(protected)/(account)/components/AchievementsPanel'
import PlayerLevelPanel from '@/app/(protected)/(account)/components/PlayerLevelPanel'
import PlayerStatsPanel from '@/app/(protected)/(account)/components/PlayerStatsPanel'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import { MedalView } from '@/app/(protected)/(game)/models/MedalView'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'

/**
 * "Mi progreso" page (/progress, from the player's menu): everything the player
 * builds up for good in the app — its level, the stats of all its games, its
 * streak and its achievements.
 */
export default function ProgressPage({ stats, medals }: { stats: PlayerStats; medals: MedalView[] }) {
  return (
    <div className="progress-page">
      <PlayerLevelPanel stats={stats} />
      <PlayerStatsPanel stats={stats} />
      <AchievementsPanel medals={medals} />
      <AdSlot />
    </div>
  )
}
