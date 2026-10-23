'use client'

import './index.scss'
import classNames from 'classnames'
import { useI18n } from '@/app/i18n/I18nProvider'

const AVATAR_COLORS = ['#ffc233', '#22d3ee', '#ff4d8d', '#84f06b', '#a78bfa', '#fb923c']

interface PlayerAvatarProps {
  name: string
  /** Background color; by default one derived from the name. */
  color?: string
  /** Level of the player (see utils/xp.ts), shown as a small badge; none when missing. */
  level?: number | null
  className?: string
}

/**
 * Round "player badge" avatar: the initial of the player name over a color
 * (derived from the name by default), with the player's level in a corner.
 */
export default function PlayerAvatar({ name, color, level, className }: PlayerAvatarProps) {
  const { t } = useI18n()
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const backgroundColor = color ?? AVATAR_COLORS[hash % AVATAR_COLORS.length]

  return (
    <span className={classNames('player-avatar', className)} style={{ backgroundColor }}>
      {initial}
      {level != null && (
        <span className="level" title={t('xp.level', { level })}>
          {level}
        </span>
      )}
    </span>
  )
}
