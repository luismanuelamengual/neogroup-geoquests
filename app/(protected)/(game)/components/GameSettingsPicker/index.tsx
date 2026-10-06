'use client'

import './index.scss'
import classNames from 'classnames'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { GameSettingsOptions } from '@/app/(protected)/(game)/models/GameSettingsOptions'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import { useT } from '@/app/i18n/I18nProvider'

interface GameSettingsPickerProps {
  /** Rules that can be chosen, with their allowed values. */
  options: GameSettingsOptions
  value: GameSettingsInput
  onChange: (value: GameSettingsInput) => void
  /** Accent: the one of the mode (single player or multiplayer). */
  multiplayer?: boolean
  disabled?: boolean
}

interface ChoiceGroupProps<T> {
  label: string
  options: T[]
  value: T | undefined
  format: (option: T) => string
  onChange: (option: T) => void
  disabled?: boolean
}

/** A rule and its allowed values, as a row of pills (only one selected). */
function ChoiceGroup<T>({ label, options, value, format, onChange, disabled }: ChoiceGroupProps<T>) {
  return (
    <div className="group">
      <span className="label">{label}</span>
      <div className="choices" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={option === value}
            className={classNames('choice', { selected: option === value })}
            disabled={disabled}
            onClick={() => onChange(option)}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Rules of the game the player is about to create (map picker of a mode):
 * only the ones the mode lets choose — e.g. rounds and time per round in the
 * classic modes, the time per round and the rounds per elimination in battle royale.
 */
export default function GameSettingsPicker({
  options,
  value,
  onChange,
  multiplayer,
  disabled
}: GameSettingsPickerProps) {
  const t = useT()

  if (!options.rounds && !options.timeLimitSeconds && !options.roundsPerElimination) {
    return null
  }

  return (
    <section className={classNames('game-settings-picker', { multi: multiplayer })} aria-label={t('picker.rules')}>
      <h2 className="title">{t('picker.rules')}</h2>
      <div className="groups">
        {options.rounds && (
          <ChoiceGroup
            label={t('picker.rounds')}
            options={options.rounds}
            value={value.rounds}
            format={(rounds) => String(rounds)}
            onChange={(rounds) => onChange({ ...value, rounds })}
            disabled={disabled}
          />
        )}
        {options.timeLimitSeconds && (
          <ChoiceGroup
            label={t('picker.timePerRound')}
            options={options.timeLimitSeconds}
            value={value.timeLimitSeconds}
            format={(seconds) => (seconds ? formatTimeLimit(seconds, t) : t('modes.noTime'))}
            onChange={(timeLimitSeconds) => onChange({ ...value, timeLimitSeconds })}
            disabled={disabled}
          />
        )}
        {options.roundsPerElimination && (
          <ChoiceGroup
            label={t('picker.roundsPerElimination')}
            options={options.roundsPerElimination}
            value={value.roundsPerElimination}
            format={(rounds) => String(rounds)}
            onChange={(roundsPerElimination) => onChange({ ...value, roundsPerElimination })}
            disabled={disabled}
          />
        )}
      </div>
    </section>
  )
}
