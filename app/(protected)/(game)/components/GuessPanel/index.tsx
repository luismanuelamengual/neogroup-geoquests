'use client'

import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'
import MapIcon from '@mui/icons-material/Map'
import IconButton from '@mui/material/IconButton'
import classNames from 'classnames'
import GuessMap from '@/app/(protected)/(game)/components/GuessMap'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { getModeColor } from '@/app/(protected)/(game)/utils/modeColor'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

interface GuessPanelProps {
  onSubmit: () => void
  submitting: boolean
  /** Keeps the panel mounted but out of sight and reach (e.g. during the round countdown). */
  hidden?: boolean
  /**
   * Locks the map (anti-cheat: the window lost the focus during the round): the
   * pin can not be moved, only the one already placed can be sent, or the round
   * skipped when there is none.
   */
  frozen?: boolean
}

/**
 * The guess map + "Adivinar" button, laid out per device:
 *  - desktop: a small map floating bottom-right that grows while hovered;
 *  - phone/tablet: a floating "Mapa" button that opens the map as a bottom sheet.
 */
export default function GuessPanel({ onSubmit, submitting, hidden = false, frozen = false }: GuessPanelProps) {
  const t = useT()
  const guess = useGameStore((state) => state.guess)
  const modeColor = getModeColor(useGameStore((state) => state.game?.mode))
  const setGuess = useGameStore((state) => state.setGuess)
  const open = useGameStore((state) => state.mapOpen)
  const setOpen = useGameStore((state) => state.setMapOpen)

  return (
    <>
      <div className={classNames('guess-panel', { open, hidden, frozen, 'has-guess': !!guess })}>
        <div className="sheet-header">
          <span className="sheet-title">{t('game.whereAreYou')}</span>
          <IconButton className="close" size="small" onClick={() => setOpen(false)} aria-label={t('game.closeMap')}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="map-wrapper">
          <GuessMap guess={guess} onGuessChange={setGuess} disabled={submitting || frozen} />
          {frozen && (
            <div className="frozen-overlay" role="alert">
              <LockIcon className="frozen-icon" />
              <span className="frozen-title">{t('game.mapFrozenTitle')}</span>
              <span className="frozen-text">
                {t('game.mapFrozenText')} {guess ? t('game.mapFrozenWithGuess') : t('game.mapFrozenWithoutGuess')}
              </span>
            </div>
          )}
        </div>
        <GameButton
          color="lime"
          fullWidth
          className="guess-button"
          disabled={!guess && !frozen}
          loading={submitting}
          onClick={onSubmit}
        >
          {guess ? t('game.guess') : frozen ? t('game.skipRound') : t('game.markAPoint')}
        </GameButton>
      </div>
      <GameButton
        color={modeColor}
        className={classNames('guess-panel-fab', { hidden: open || hidden })}
        startIcon={<MapIcon />}
        onClick={() => setOpen(true)}
      >
        {guess ? t('game.guessShort') : t('game.map')}
      </GameButton>
    </>
  )
}
