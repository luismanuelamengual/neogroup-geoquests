import './index.scss'
import classNames from 'classnames'

/** Chunky segmented progress bar showing `value / max` (a round or a game score). */
export default function ScoreBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0

  return (
    <div className={classNames('score-bar', className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="fill" style={{ width: `${percentage}%` }} />
    </div>
  )
}
