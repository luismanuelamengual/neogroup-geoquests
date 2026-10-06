'use client'

import './index.scss'
import classNames from 'classnames'
import { DETECTIVE_DIFFICULTY_LEVELS, DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

interface DetectiveDifficultyPickerProps {
  value: DetectiveDifficulty
  onChange: (difficulty: DetectiveDifficulty) => void
  /** Difficulties that can be chosen (all of them by default). */
  levels?: DetectiveDifficulty[]
  disabled?: boolean
  className?: string
}

/** Chooser of the difficulty of a new detective case (easy, medium or hard). */
export default function DetectiveDifficultyPicker({
  value,
  onChange,
  levels,
  disabled,
  className
}: DetectiveDifficultyPickerProps) {
  const t = useT()

  return (
    <div
      className={classNames('detective-difficulty-picker', className)}
      role="radiogroup"
      aria-label={t('detective.intro.difficulty')}
    >
      {DETECTIVE_DIFFICULTY_LEVELS.filter((level) => !levels || levels.includes(level)).map((level) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={level === value}
          className={classNames('difficulty', level, { selected: level === value })}
          disabled={disabled}
          onClick={() => onChange(level)}
        >
          <span className="name">{t(`detective.difficulty.${level}.name` as MessageKey)}</span>
          <span className="summary">{t(`detective.difficulty.${level}.summary` as MessageKey)}</span>
        </button>
      ))}
    </div>
  )
}
