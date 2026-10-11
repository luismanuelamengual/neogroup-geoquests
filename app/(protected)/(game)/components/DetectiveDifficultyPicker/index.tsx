'use client'

import './index.scss'
import classNames from 'classnames'
import { DETECTIVE_DIFFICULTY_LEVELS, DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { DETECTIVE_DIFFICULTIES } from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

interface DetectiveDifficultyPickerProps {
  /** A card was pressed: the case of that difficulty starts. */
  onSelect: (difficulty: DetectiveDifficulty) => void
  /** Difficulties offered (all of them by default). */
  levels?: DetectiveDifficulty[]
  disabled?: boolean
  className?: string
}

/** One card per difficulty of a detective case (easy, medium or hard), with its main rules. */
export default function DetectiveDifficultyPicker({
  onSelect,
  levels,
  disabled,
  className
}: DetectiveDifficultyPickerProps) {
  const t = useT()

  return (
    <div className={classNames('detective-difficulty-picker', className)}>
      {DETECTIVE_DIFFICULTY_LEVELS.filter((level) => !levels || levels.includes(level)).map((level) => {
        const rules = DETECTIVE_DIFFICULTIES[level]

        return (
          <button
            key={level}
            type="button"
            className={classNames('difficulty', level)}
            disabled={disabled}
            onClick={() => onSelect(level)}
          >
            <span className="name">{t(`detective.difficulty.${level}.name` as MessageKey)}</span>
            <span className="summary">{t(`detective.difficulty.${level}.summary` as MessageKey)}</span>
            <ul className="rules">
              <li>{t('detective.difficulty.places', { count: rules.hops })}</li>
              <li>{t('detective.difficulty.options', { count: rules.options })}</li>
              <li>{t('detective.difficulty.suspects', { count: rules.suspects })}</li>
              <li>{t('detective.difficulty.mistakes', { count: rules.maxMistakes })}</li>
            </ul>
          </button>
        )
      })}
    </div>
  )
}
