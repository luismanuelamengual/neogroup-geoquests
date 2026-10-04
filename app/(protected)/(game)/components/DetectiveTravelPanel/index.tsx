'use client'

import './index.scss'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Dialog from '@mui/material/Dialog'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import DetectiveMap, { DetectiveMapMarker } from '@/app/(protected)/(game)/components/DetectiveMap'
import { DetectiveCurrentStageView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { getTravelMinutes } from '@/app/(protected)/(game)/utils/detective'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import GameButton from '@/app/components/GameButton'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Letters of the destinations offered (pins and list). */
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

interface DetectiveTravelPanelProps {
  open: boolean
  stage: DetectiveCurrentStageView
  onClose: () => void
  onTravel: (placeId: number) => Promise<void>
  /** No more mistakes allowed: a wrong destination now loses the trail. */
  lastChance?: boolean
}

/**
 * Where to travel: the destinations offered on a map (and where the
 * detective is), each one with the time its trip costs, next to the clues
 * heard so far. The detective picks one and confirms (warned when a mistake
 * would lose the trail).
 */
export default function DetectiveTravelPanel({
  open,
  stage,
  onClose,
  onTravel,
  lastChance
}: DetectiveTravelPanelProps) {
  const { t, locale } = useI18n()
  const [selected, setSelected] = useState<number | null>(null)
  const [traveling, setTraveling] = useState(false)
  const clues = stage.witnesses.flatMap((witness) => (witness.clue ? [witness.clue[locale]] : []))
  const chosen = stage.options.find((option) => option.placeId === selected) ?? null
  const markers = useMemo<DetectiveMapMarker[]>(
    () => [
      { id: 'here', position: stage.location, label: '★', variant: 'target', color: '#22d3ee' },
      ...stage.options.map((option, index) => ({
        id: String(option.placeId),
        position: option,
        label: LETTERS[index],
        variant: 'guess' as const,
        selected: option.placeId === selected,
        onClick: () => setSelected(option.placeId)
      }))
    ],
    [stage, selected]
  )
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
      onClose={traveling ? undefined : onClose}
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
              {stage.options.map((option, index) => (
                <li key={option.placeId}>
                  <button
                    type="button"
                    className={classNames('option', { selected: option.placeId === selected })}
                    onClick={() => setSelected(option.placeId)}
                  >
                    <span className="letter">{LETTERS[index]}</span>
                    <span className="info">
                      <span className="place">
                        {countryFlag(option.countryCode)} {option.placeName}
                      </span>
                      <span className="time">
                        {t('detective.travelPanel.duration', {
                          time: formatDuration(getTravelMinutes(stage.location, option))
                        })}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
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
          <GameButton color="ghost" onClick={onClose} disabled={traveling}>
            {t('detective.travelPanel.cancel')}
          </GameButton>
          <GameButton
            size="large"
            startIcon={<FlightTakeoffIcon />}
            disabled={!chosen}
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
