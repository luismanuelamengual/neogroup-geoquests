'use client'

import './index.scss'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { useCountUp } from '@/app/(protected)/(game)/hooks/useCountUp'
import { GameXpView } from '@/app/(protected)/(game)/models/GameXpView'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import { getLevelProgress } from '@/app/(protected)/(game)/utils/xp'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Delay before the bar starts filling (after the score reveal of the summaries). */
const START_DELAY_MS = 900
const DURATION_MS = 1600

/**
 * XP a finished game gave the player (game summaries): "+N XP" and the level
 * bar filling from the XP it had before the game, with a "level up" banner
 * when it crosses a level.
 */
export default function XpProgress({ xp }: { xp: GameXpView }) {
  const { t, locale } = useI18n()
  const before = xp.total - xp.earned
  const animated = before + useCountUp(xp.earned, DURATION_MS, START_DELAY_MS)
  const start = getLevelProgress(before)
  const current = getLevelProgress(animated)
  const leveledUp = current.level > start.level

  return (
    <div className="xp-progress">
      <div className="header">
        <span className="level">
          {t('xp.level', { level: current.level })} · {t(`xp.ranks.${current.rank}` as MessageKey)}
        </span>
        <span className="earned">{t('xp.earned', { xp: formatScore(xp.earned, locale) })}</span>
      </div>
      <ScoreBar value={current.levelXp} max={current.nextLevelXp} className="bar" />
      <div className="footer">
        {formatScore(current.levelXp, locale)} / {formatScore(current.nextLevelXp, locale)} XP
      </div>
      {leveledUp && (
        <div key={current.level} className="level-up">
          {t('xp.levelUp', { level: current.level })}
        </div>
      )}
    </div>
  )
}
