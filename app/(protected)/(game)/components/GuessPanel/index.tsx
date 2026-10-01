'use client'

import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import MapIcon from '@mui/icons-material/Map'
import IconButton from '@mui/material/IconButton'
import classNames from 'classnames'
import { useState } from 'react'
import GuessMap from '@/app/(protected)/(game)/components/GuessMap'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

interface GuessPanelProps {
  onSubmit: () => void
  submitting: boolean
}

/**
 * The guess map + "Adivinar" button, laid out per device:
 *  - desktop: a small map floating bottom-right that grows while hovered;
 *  - phone/tablet: a floating "Mapa" button that opens the map as a bottom sheet.
 */
export default function GuessPanel({ onSubmit, submitting }: GuessPanelProps) {
  const t = useT()
  const guess = useGameStore((state) => state.guess)
  const setGuess = useGameStore((state) => state.setGuess)
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={classNames('guess-panel', { open, 'has-guess': !!guess })}>
        <div className="sheet-header">
          <span className="sheet-title">{t('game.whereAreYou')}</span>
          <IconButton className="close" size="small" onClick={() => setOpen(false)} aria-label={t('game.closeMap')}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="map-wrapper">
          <GuessMap guess={guess} onGuessChange={setGuess} disabled={submitting} />
        </div>
        <GameButton
          color="lime"
          fullWidth
          className="guess-button"
          disabled={!guess}
          loading={submitting}
          onClick={onSubmit}
        >
          {guess ? t('game.guess') : t('game.markAPoint')}
        </GameButton>
      </div>
      <GameButton
        color="gold"
        className={classNames('guess-panel-fab', { hidden: open })}
        startIcon={<MapIcon />}
        onClick={() => setOpen(true)}
      >
        {guess ? t('game.guessShort') : t('game.map')}
      </GameButton>
    </>
  )
}
