import './index.scss'
import classNames from 'classnames'

const AVATAR_COLORS = ['#ffc233', '#22d3ee', '#ff4d8d', '#84f06b', '#a78bfa', '#fb923c']

/** Round "player badge" avatar: the initial of the player name over a color derived from it. */
export default function PlayerAvatar({ name, className }: { name: string; className?: string }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length]

  return (
    <span className={classNames('player-avatar', className)} style={{ backgroundColor: color }}>
      {initial}
    </span>
  )
}
