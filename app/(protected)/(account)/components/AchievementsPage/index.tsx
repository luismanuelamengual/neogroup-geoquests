'use client'

import './index.scss'
import AchievementsPanel from '@/app/(protected)/(account)/components/AchievementsPanel'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import { MedalView } from '@/app/(protected)/(game)/models/MedalView'

/** "Logros" page (/achievements, from the main navigation): every medal of the player, won or still to win. */
export default function AchievementsPage({ medals }: { medals: MedalView[] }) {
  return (
    <div className="achievements-page">
      <AchievementsPanel medals={medals} />
      <AdSlot />
    </div>
  )
}
