'use client'

import './index.scss'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CheckIcon from '@mui/icons-material/Check'
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled'
import PublicIcon from '@mui/icons-material/Public'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import ScheduleIcon from '@mui/icons-material/Schedule'
import classNames from 'classnames'
import { useState } from 'react'
import SpeechBubble from '@/app/(protected)/(game)/components/SpeechBubble'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { DetectiveWitnessView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { ClueKind, ROLE_CLUE_KIND } from '@/app/(protected)/(game)/models/WitnessRole'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { generateWitness } from '@/app/(protected)/(game)/utils/witnesses'
import { getSuspectClueText, getWitnessIntro, getWitnessRoleName } from '@/app/(protected)/(game)/utils/witnessText'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Icon of the kind of clue each witness knows about (by its job). */
const CLUE_KIND_ICONS: Record<ClueKind, typeof PublicIcon> = {
  geography: PublicIcon,
  culture: RestaurantIcon,
  history: AccountBalanceIcon
}

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
 * The witnesses of a stage, standing over the Street View, each with an icon of
 * the kind of clue its job knows about (geography, customs or history). Tapping
 * one asks it (the first time it costs fictional time) and it says its clues in a
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
        const isOpen = open === index && witness.clues.length > 0
        const silent = noTime && !witness.asked
        const kind = ROLE_CLUE_KIND[witness.role]
        const KindIcon = CLUE_KIND_ICONS[kind]
        const kindLabel = t(`detective.clueKinds.${kind}` as MessageKey)

        return (
          <div key={witness.seed} className={classNames('witness', { open: isOpen, asked: witness.asked, silent })}>
            {isOpen && (
              <SpeechBubble
                className="bubble"
                speaker={`${traits.name} · ${getWitnessRoleName(t, witness.role, traits.presentation)}`}
                text={[
                  getWitnessIntro(t, traits.introIndex),
                  ...witness.clues.map((clue) => clue[locale]),
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
              aria-label={`${traits.name}, ${getWitnessRoleName(t, witness.role, traits.presentation)}. ${kindLabel}`}
              title={kindLabel}
            >
              <WitnessAvatar
                seed={witness.seed}
                role={witness.role}
                expression={talking ? 'talking' : isOpen ? 'smile' : asking === index ? 'surprised' : 'neutral'}
                size={112}
                className="avatar"
              />
              <span className="tag">
                <span className={classNames('kind', kind)} aria-hidden="true">
                  <KindIcon />
                </span>
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
