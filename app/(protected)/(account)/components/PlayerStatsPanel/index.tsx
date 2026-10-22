'use client'

import './index.scss'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Stats of the player over all its games, and its streak (profile page). */
export default function PlayerStatsPanel({ stats }: { stats: PlayerStats }) {
  const { t, locale } = useI18n()
  const items = [
    { label: t('stats.games'), value: String(stats.gamesPlayed) },
    { label: t('stats.casesSolved'), value: String(stats.casesSolved) },
    { label: t('stats.bestScore'), value: formatScore(stats.bestScore, locale) },
    { label: t('stats.average'), value: formatScore(stats.averageScore, locale) },
    { label: t('stats.currentStreak'), value: `🔥 ${stats.currentStreak}` },
    { label: t('stats.bestStreak'), value: String(stats.bestStreak) }
  ]

  return (
    <GamePanel className="player-stats-panel" title={t('stats.title')} accent="cyan">
      <div className="stats">
        {items.map((item) => (
          <div key={item.label} className="stat">
            <span className="value">{item.value}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </div>
    </GamePanel>
  )
}
