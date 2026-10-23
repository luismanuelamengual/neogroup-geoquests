'use client'

import './index.scss'
import { getTierName, parseMedalKey, XP_PER_ACHIEVEMENT } from '@/app/(protected)/(game)/utils/achievements'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Medals a finished game gave the player (game summaries): "¡Logro nuevo!" with each one and its XP. */
export default function NewAchievements({ keys }: { keys: string[] }) {
  const { t } = useI18n()
  const medals = keys.flatMap((key) => {
    const medal = parseMedalKey(key)

    return medal ? [{ key, ...medal }] : []
  })

  if (medals.length === 0) {
    return null
  }

  return (
    <div className="new-achievements">
      <span className="title">{t('achievements.new', { count: medals.length })}</span>
      <ul className="medals">
        {medals.map(({ key, achievement, tier }, index) => (
          <li key={key} className="medal" style={{ animationDelay: `${1200 + index * 200}ms` }}>
            <span className="icon">{achievement.icon}</span>
            <span className="name">
              {t(`achievements.items.${achievement.id}.name` as MessageKey)}
              {tier !== null && ` · ${t(`achievements.tiers.${getTierName(achievement, tier)}` as MessageKey)}`}
            </span>
            <span className="xp">{t('achievements.xp', { xp: XP_PER_ACHIEVEMENT })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
