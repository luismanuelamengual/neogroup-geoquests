'use client'

import './index.scss'
import CheckIcon from '@mui/icons-material/Check'
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled'
import ScheduleIcon from '@mui/icons-material/Schedule'
import classNames from 'classnames'
import { useState } from 'react'
import SpeechBubble from '@/app/(protected)/(game)/components/SpeechBubble'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { DetectiveWitnessView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { generateWitness } from '@/app/(protected)/(game)/utils/witnesses'
import { getSuspectClueText, getWitnessIntro, getWitnessRoleName } from '@/app/(protected)/(game)/utils/witnessText'
import { useI18n } from '@/app/i18n/I18nProvider'

interface DetectiveWitnessesProps {
  witnesses: DetectiveWitnessView[]
  /** Minutes each new witness costs. */
  witnessMinutes: number
  /** Talks to a witness for the first time (the server charges the time and returns its clue). */
  onAsk: (index: number) => Promise<void>
  /** Not enough time left for a new witness: only the ones already asked can be listened to again. */
  noTime?: boolean
  disabled?: boolean
}

/**
 * The witnesses of a stage, standing over the Street View. Tapping one asks
 * it (the first time it costs fictional time) and it says its clue in a
 * speech bubble, written letter by letter; tapping it again shows it again,
 * for free. Without time for a new witness, the others stay silent.
 */
export default function DetectiveWitnesses({
  witnesses,
  witnessMinutes,
  onAsk,
  noTime,
  disabled
}: DetectiveWitnessesProps) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState<number | null>(null)
  const [typing, setTyping] = useState<number | null>(null)
  const [asking, setAsking] = useState<number | null>(null)

  const handleClick = async (index: number) => {
    if (asking !== null || disabled || (noTime && !witnesses[index].asked)) {
      return
    }

    if (witnesses[index].asked) {
      setOpen(open === index ? null : index)
      setTyping(null)

      return
    }

    setAsking(index)

    try {
      await onAsk(index)
      setOpen(index)
      setTyping(index)
    } finally {
      setAsking(null)
    }
  }

  return (
    <div className="detective-witnesses">
      {witnesses.map((witness, index) => {
        const traits = generateWitness(witness.seed, witness.role)
        const talking = typing === index
        const isOpen = open === index && witness.clue
        const silent = noTime && !witness.asked

        return (
          <div key={witness.seed} className={classNames('witness', { open: isOpen, asked: witness.asked, silent })}>
            {isOpen && (
              <SpeechBubble
                className="bubble"
                speaker={`${traits.name} · ${getWitnessRoleName(t, witness.role, traits.presentation)}`}
                text={[
                  getWitnessIntro(t, traits.introIndex),
                  witness.clue![locale],
                  witness.suspectClue ? getSuspectClueText(t, witness.suspectClue) : null
                ]
                  .filter(Boolean)
                  .join(' ')}
                typing={talking}
                tail={index === 0 ? 'left' : index === witnesses.length - 1 ? 'right' : 'center'}
                onDone={() => setTyping((current) => (current === index ? null : current))}
              />
            )}
            <button
              type="button"
              className="person"
              disabled={disabled || asking !== null || silent}
              onClick={() => handleClick(index)}
              aria-label={`${traits.name}, ${getWitnessRoleName(t, witness.role, traits.presentation)}`}
            >
              <WitnessAvatar
                seed={witness.seed}
                role={witness.role}
                expression={talking ? 'talking' : isOpen ? 'smile' : asking === index ? 'surprised' : 'neutral'}
                size={112}
                className="avatar"
              />
              <span className="tag">
                <span className="name">{traits.name}</span>
                <span className={classNames('cost', { done: witness.asked, none: silent })}>
                  {witness.asked ? <CheckIcon /> : silent ? <HourglassDisabledIcon /> : <ScheduleIcon />}
                  {witness.asked ? null : silent ? (
                    <span className="label">{t('detective.play.noTime')}</span>
                  ) : (
                    formatDuration(witnessMinutes)
                  )}
                </span>
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
