'use client'

import './index.scss'
import Tooltip from '@mui/material/Tooltip'
import classNames from 'classnames'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * The streak of the player in the top bar: 🔥 and the days in a row. Dimmed
 * while today's game is still missing (the streak is at risk).
 */
export default function StreakBadge({ stats }: { stats: PlayerStats }) {
  const t = useT()
  const count = stats.currentStreak
  const hint = count > 0 ? (stats.playedToday ? t('streak.safeToday') : t('streak.playToday')) : t('streak.playToday')

  return (
    <Tooltip
      title={
        <>
          {t('streak.tooltip', { count })}
          <br />
          {hint}
          {stats.streakFreezes > 0 && (
            <>
              <br />
              🧊 {t('streak.freezes', { count: stats.streakFreezes })}
            </>
          )}
        </>
      }
      enterTouchDelay={0}
    >
      <span className={classNames('streak-badge', { 'at-risk': !stats.playedToday })} tabIndex={0}>
        <span className="flame" aria-hidden>
          🔥
        </span>
        <span className="count">{count}</span>
      </span>
    </Tooltip>
  )
}
