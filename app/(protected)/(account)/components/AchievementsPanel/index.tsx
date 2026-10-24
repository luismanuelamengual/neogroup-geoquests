'use client'

import './index.scss'
import classNames from 'classnames'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { MedalView } from '@/app/(protected)/(game)/models/MedalView'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Medals of the player ("Logros", /achievements): the ones it won and, grayed out, the ones still to win with how far it is. */
export default function AchievementsPanel({ medals }: { medals: MedalView[] }) {
  const { t, locale } = useI18n()
  const unlocked = medals.filter((medal) => medal.unlockedAt !== null).length
  const percent = medals.length > 0 ? Math.round((unlocked / medals.length) * 100) : 0

  return (
    <GamePanel className="achievements-panel" accent="magenta">
      <div className="summary">
        <div className="totals">
          <span className="count">{t('achievements.count', { unlocked, total: medals.length })}</span>
          <span className="percent">{t('achievements.completed', { percent })}</span>
        </div>
        <ScoreBar value={unlocked} max={medals.length} className="bar" />
      </div>
      <ul className="medals">
        {medals.map((medal) => {
          const won = medal.unlockedAt !== null

          return (
            <li key={medal.key} className={classNames('medal', { won })}>
              <span className="icon">{medal.icon}</span>
              <div className="info">
                <span className="name">
                  {t(`achievements.items.${medal.id}.name` as MessageKey)}
                  {medal.tierName !== null && (
                    <span className={classNames('tier', medal.tierName)}>
                      {t(`achievements.tiers.${medal.tierName}` as MessageKey)}
                    </span>
                  )}
                </span>
                <span className="description">
                  {t(`achievements.items.${medal.id}.description` as MessageKey, { count: medal.target ?? 0 })}
                </span>
                {won ? (
                  <span className="date">{new Date(medal.unlockedAt!).toLocaleDateString(locale)}</span>
                ) : (
                  medal.target !== null &&
                  medal.value !== null && (
                    <div className="progress">
                      <ScoreBar value={medal.value} max={medal.target} className="bar" />
                      <span>{t('achievements.progress', { value: medal.value, target: medal.target })}</span>
                    </div>
                  )
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </GamePanel>
  )
}
