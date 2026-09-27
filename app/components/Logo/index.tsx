import './index.scss'
import classNames from 'classnames'

/** GeoQuests wordmark: a map pin + the name in the display font. */
export default function Logo({
  size = 'medium',
  className
}: {
  size?: 'small' | 'medium' | 'large'
  className?: string
}) {
  return (
    <span className={classNames('logo', `size-${size}`, className)}>
      <svg className="pin" viewBox="0 0 24 32" aria-hidden="true">
        <path
          d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z"
          fill="var(--color-magenta)"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="11.5" r="5" fill="var(--color-gold)" />
      </svg>
      <span className="word">
        Geo<span className="accent">Quests</span>
      </span>
    </span>
  )
}
