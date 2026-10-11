'use client'

import './index.scss'
import BlockIcon from '@mui/icons-material/Block'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Dialog from '@mui/material/Dialog'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import DetectiveMap, { DetectiveMapMarker } from '@/app/(protected)/(game)/components/DetectiveMap'
import { DetectiveCurrentStageView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { getTravelMinutes } from '@/app/(protected)/(game)/utils/detective'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { MAX_OPTIONS } from '@/app/(protected)/(game)/utils/detectiveEvents'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import GameButton from '@/app/components/GameButton'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Letters of the destinations offered (pins and list). */
const LETTERS = Array.from({ length: MAX_OPTIONS }, (_, index) => String.fromCharCode(65 + index))

interface DetectiveTravelPanelProps {
  open: boolean
  stage: DetectiveCurrentStageView
  onClose: () => void
  onTravel: (placeId: number) => Promise<void>
  /** No more mistakes allowed: a wrong destination now loses the trail. */
  lastChance?: boolean
  /** Minutes left in the case (a call needs time for it). */
  timeLeft: number
  /** Calls the central office (the server rules out some wrong destinations). */
  onCall: () => Promise<void>
}

/**
 * Where to travel: the destinations offered on a map (and where the
 * detective is), each one with the time its trip costs (ruled out ones crossed
 * out), next to the clues heard so far. The detective can call the central
 * office to rule out some wrong destinations, and picks one and confirms
 * (warned when a mistake would lose the trail).
 */
export default function DetectiveTravelPanel({
  open,
  stage,
  onClose,
  onTravel,
  lastChance,
  timeLeft,
  onCall
}: DetectiveTravelPanelProps) {
  const { t, locale } = useI18n()
  const [selected, setSelected] = useState<number | null>(null)
  const [traveling, setTraveling] = useState(false)
  const [calling, setCalling] = useState(false)
  const clues = stage.witnesses.flatMap((witness) => witness.clues.map((clue) => clue[locale]))
  const isOut = (placeId: number) => stage.eliminated.includes(placeId)
  const chosen = stage.options.find((option) => option.placeId === selected && !isOut(option.placeId)) ?? null
  const markers = useMemo<DetectiveMapMarker[]>(
    () => [
      { id: 'here', position: stage.location, label: '★', variant: 'target', color: '#22d3ee' },
      // The ruled out destinations leave the map.
      ...stage.options.flatMap((option, index) =>
        stage.eliminated.includes(option.placeId)
          ? []
          : [
              {
                id: String(option.placeId),
                position: option,
                label: LETTERS[index],
                variant: 'guess' as const,
                selected: option.placeId === selected,
                onClick: () => setSelected(option.placeId)
              }
            ]
      )
    ],
    [stage, selected]
  )
  const { call } = stage
  const decoysLeft = stage.options.length - stage.eliminated.length - 1
  // Why the central office can not be called now (null: it can).
  const callBlocked =
    call.left <= 0
      ? t('detective.call.noneLeft')
      : !call.available
        ? t('detective.call.linesDown')
        : decoysLeft <= 1
          ? t('detective.call.nothingToRuleOut')
          : timeLeft < call.minutes
            ? t('detective.call.noTime')
            : null

  const handleCall = async () => {
    setCalling(true)

    try {
      await onCall()
    } finally {
      setCalling(false)
    }
  }

  const legs = useMemo(
    () => (chosen ? [{ from: stage.location, to: chosen, kind: 'travel' as const }] : []),
    [stage.location, chosen]
  )

  const handleTravel = async () => {
    if (selected == null) {
      return
    }

    setTraveling(true)

    try {
      await onTravel(selected)
    } finally {
      setTraveling(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={traveling || calling ? undefined : onClose}
      maxWidth="lg"
      fullWidth
      className="detective-travel-dialog"
    >
      <div className="detective-travel-panel">
        <h2 className="title">{t('detective.travelPanel.title')}</h2>
        <div className="layout">
          <DetectiveMap className="map" markers={markers} legs={legs} />
          <div className="side">
            <ol className="options">
              {stage.options.map((option, index) => {
                const out = isOut(option.placeId)

                return (
                  <li key={option.placeId}>
                    <button
                      type="button"
                      className={classNames('option', { selected: chosen?.placeId === option.placeId, out })}
                      disabled={out}
                      onClick={() => setSelected(option.placeId)}
                    >
                      <span className="letter">{out ? <BlockIcon /> : LETTERS[index]}</span>
                      <span className="info">
                        <span className="place">
                          {countryFlag(option.countryCode)} {option.placeName}
                        </span>
                        <span className="time">
                          {out
                            ? t('detective.call.ruledOut')
                            : t('detective.travelPanel.duration', {
                                // The same trip the server charges: the events of the stage may make it longer or shorter.
                                time: formatDuration(
                                  Math.max(30, getTravelMinutes(stage.location, option) + stage.flightMinutes)
                                )
                              })}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {(call.left > 0 || !call.available) && (
              <div className={classNames('call', { blocked: !!callBlocked })}>
                <GameButton
                  color="cyan"
                  fullWidth
                  startIcon={<PhoneInTalkIcon />}
                  disabled={!!callBlocked || traveling}
                  loading={calling}
                  onClick={handleCall}
                >
                  {t('detective.call.button')}
                </GameButton>
                <p className="call-info">
                  {callBlocked ??
                    `${t('detective.call.detail', {
                      count: Math.min(call.eliminates, decoysLeft - 1),
                      time: formatDuration(call.minutes)
                    })} · ${t('detective.call.left', { count: call.left })}`}
                </p>
              </div>
            )}
            <div className="clues">
              <h3 className="clues-title">{t('detective.travelPanel.clues')}</h3>
              {clues.length === 0 ? (
                <p className="no-clues">{t('detective.travelPanel.noClues')}</p>
              ) : (
                <ul>
                  {clues.map((clue) => (
                    <li key={clue}>
                      <FormatQuoteIcon className="quote" />
                      {clue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="actions">
          {lastChance && (
            <p className="last-chance">
              <WarningAmberIcon /> {t('detective.travelPanel.lastChance')}
            </p>
          )}
          <GameButton color="ghost" onClick={onClose} disabled={traveling || calling}>
            {t('detective.travelPanel.cancel')}
          </GameButton>
          <GameButton
            size="large"
            startIcon={<FlightTakeoffIcon />}
            disabled={!chosen || calling}
            loading={traveling}
            onClick={handleTravel}
          >
            {chosen ? t('detective.travelPanel.go', { place: chosen.placeName }) : t('detective.travelPanel.choose')}
          </GameButton>
        </div>
      </div>
    </Dialog>
  )
}
