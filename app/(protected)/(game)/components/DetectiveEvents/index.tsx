'use client'

import './index.scss'
import AddIcCallIcon from '@mui/icons-material/AddIcCall'
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive'
import BlockIcon from '@mui/icons-material/Block'
import CampaignIcon from '@mui/icons-material/Campaign'
import FastForwardIcon from '@mui/icons-material/FastForward'
import FlightIcon from '@mui/icons-material/Flight'
import ForumIcon from '@mui/icons-material/Forum'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import GroupRemoveIcon from '@mui/icons-material/GroupRemove'
import MoreTimeIcon from '@mui/icons-material/MoreTime'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled'
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk'
import ShieldIcon from '@mui/icons-material/Shield'
import SignalCellularAlt1BarIcon from '@mui/icons-material/SignalCellularAlt1Bar'
import SnoozeIcon from '@mui/icons-material/Snooze'
import TimerOffIcon from '@mui/icons-material/TimerOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Dialog from '@mui/material/Dialog'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { DetectiveEventType } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectiveCurrentStageView, DetectiveEventView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { FLIGHT_EVENT_MINUTES } from '@/app/(protected)/(game)/utils/detectiveEvents'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'

const EVENT_ICONS: Record<DetectiveEventType, typeof FlightIcon> = {
  extraWitness: PersonAddIcon,
  talkative: ForumIcon,
  sharpEye: VisibilityIcon,
  suspectCleared: GroupRemoveIcon,
  extraTime: MoreTimeIcon,
  ruledOut: BlockIcon,
  quickWitnesses: FastForwardIcon,
  extraCall: AddIcCallIcon,
  hotline: PhoneInTalkIcon,
  secondChance: ShieldIcon,
  directFlight: FlightIcon,
  missingWitness: PersonRemoveIcon,
  noSighting: VisibilityOffIcon,
  accomplice: GroupAddIcon,
  lostTime: TimerOffIcon,
  moreRumors: CampaignIcon,
  slowWitnesses: SnoozeIcon,
  linesDown: PhoneDisabledIcon,
  badSignal: SignalCellularAlt1BarIcon,
  pressure: WarningAmberIcon,
  delayedFlight: AirplanemodeInactiveIcon
}

/** What an event says, with the numbers of the stage where it happened. */
function getEventText(
  t: Translator,
  event: DetectiveEventView,
  stage: DetectiveCurrentStageView,
  usualWitnessMinutes: number
): string {
  const place = stage.options.find((option) => option.placeId === event.placeId)?.placeName ?? ''

  return t(`detective.events.${event.type}.text` as MessageKey, {
    time: formatDuration(
      event.type === 'extraTime' || event.type === 'lostTime'
        ? (event.minutes ?? 0)
        : event.type === 'directFlight' || event.type === 'delayedFlight'
          ? FLIGHT_EVENT_MINUTES
          : event.type === 'quickWitnesses' || event.type === 'slowWitnesses'
            ? stage.witnessMinutes
            : stage.call.minutes
    ),
    usual: formatDuration(usualWitnessMinutes),
    count: stage.call.eliminates,
    place
  })
}

/** Key of the stages whose events were already shown in this tab (so a reload does not show them again). */
function seenKey(gameId: number, stageNumber: number): string {
  return `detective-events-${gameId}-${stageNumber}`
}

function wasSeen(gameId: number, stageNumber: number): boolean {
  try {
    return window.sessionStorage.getItem(seenKey(gameId, stageNumber)) === '1'
  } catch {
    return false
  }
}

function markSeen(gameId: number, stageNumber: number): void {
  try {
    window.sessionStorage.setItem(seenKey(gameId, stageNumber), '1')
  } catch {
    // Without storage they are shown again after a reload: no harm done.
  }
}

interface DetectiveEventsProps {
  gameId: number
  stage: DetectiveCurrentStageView
  /** What a witness usually costs (to tell how much an event changed it). */
  usualWitnessMinutes: number
}

/**
 * What happened when the detective got to the stage (its random events): shown
 * in a dialog as soon as the stage opens — good news in green, bad news in red
 * — and then as small badges under the HUD, which open it again.
 */
export default function DetectiveEvents({ gameId, stage, usualWitnessMinutes }: DetectiveEventsProps) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const { events, stageNumber } = stage

  useEffect(() => {
    if (events.length > 0 && !wasSeen(gameId, stageNumber)) {
      setOpen(true)
    }
  }, [events.length, gameId, stageNumber])

  if (events.length === 0) {
    return null
  }

  const close = () => {
    markSeen(gameId, stageNumber)
    setOpen(false)
  }

  return (
    <>
      <div className="detective-events">
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.type]

          return (
            <button
              key={event.type}
              type="button"
              className={classNames('badge', event.good ? 'good' : 'bad')}
              onClick={() => setOpen(true)}
              aria-label={`${t('detective.events.show')}: ${t(`detective.events.${event.type}.title` as MessageKey)}`}
            >
              <Icon />
              <span className="label">{t(`detective.events.${event.type}.title` as MessageKey)}</span>
            </button>
          )
        })}
      </div>
      <Dialog open={open} onClose={close} maxWidth="xs" fullWidth className="detective-events-dialog">
        <div className="detective-events-panel">
          <h2 className="title">{t('detective.events.title')}</h2>
          <ul className="list">
            {events.map((event, index) => {
              const Icon = EVENT_ICONS[event.type]

              return (
                <li
                  key={event.type}
                  className={classNames('event', event.good ? 'good' : 'bad')}
                  style={{ animationDelay: `${index * 160}ms` }}
                >
                  <span className="icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="body">
                    <span className="tone">{t(event.good ? 'detective.events.good' : 'detective.events.bad')}</span>
                    <span className="name">{t(`detective.events.${event.type}.title` as MessageKey)}</span>
                    <span className="text">{getEventText(t, event, stage, usualWitnessMinutes)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
          <GameButton size="large" fullWidth onClick={close}>
            {t('detective.events.continue')}
          </GameButton>
        </div>
      </Dialog>
    </>
  )
}
