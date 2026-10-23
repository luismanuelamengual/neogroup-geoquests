'use client'

import './index.scss'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Level of the player ("Estadísticas" page): its rank, total XP and how far the next level is. */
export default function PlayerLevelPanel({ stats }: { stats: PlayerStats }) {
  const { t, locale } = useI18n()

  return (
    <GamePanel className="player-level-panel" title={t('xp.title')} accent="gold">
      <div className="summary">
        <span className="badge">{stats.level}</span>
        <div className="info">
          <span className="rank">{t(`xp.ranks.${stats.rank}` as MessageKey)}</span>
          <span className="total">{t('xp.total', { xp: formatScore(stats.xp, locale) })}</span>
        </div>
      </div>
      <ScoreBar value={stats.levelXp} max={stats.nextLevelXp} className="bar" />
      <div className="next">
        <span>
          {formatScore(stats.levelXp, locale)} / {formatScore(stats.nextLevelXp, locale)} XP
        </span>
        <span>
          {t('xp.toNextLevel', {
            xp: formatScore(stats.nextLevelXp - stats.levelXp, locale),
            level: stats.level + 1
          })}
        </span>
      </div>
    </GamePanel>
  )
}
