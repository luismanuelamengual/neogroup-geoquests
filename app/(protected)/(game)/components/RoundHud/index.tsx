'use client'

import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import BackgroundMusic from '@/app/(protected)/(game)/components/BackgroundMusic'
import MusicToggle from '@/app/(protected)/(game)/components/MusicToggle'
import { getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import { useI18n } from '@/app/i18n/I18nProvider'

interface RoundHudProps {
  mapSlug: string | null
  roundNumber: number
  /** Rounds of the game (null when it is not known beforehand, e.g. battle royale). */
  roundsCount: number | null
  totalScore?: number
  /** A chip to show instead of the score (e.g. the players left in battle royale). */
  stat?: { caption: string; value: ReactNode }
  /** Countdown of the round (timed games). */
  timer?: ReactNode
  /** What the exit confirmation says (by default: the game stays saved). */
  exitMessage?: string
  /** What exiting does (by default: back to the main menu). */
  onExit?: () => void
}

/** Heads-up display of the play screen: exit, map, round countdown, round counter and total score. */
export default function RoundHud({
  mapSlug,
  roundNumber,
  roundsCount,
  totalScore = 0,
  stat,
  timer,
  exitMessage,
  onExit
}: RoundHudProps) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [confirmExit, setConfirmExit] = useState(false)

  return (
    <div className="round-hud">
      <IconButton className="exit" onClick={() => setConfirmExit(true)} aria-label={t('game.exitAria')}>
        <CloseIcon />
      </IconButton>
      <div className="chip map">{getMapName(t, mapSlug)}</div>
      <BackgroundMusic />
      <MusicToggle />
      <div className="spacer" />
      {timer}
      <div className="chip round">
        <span className="caption">{t('game.round')}</span>
        <span className="value">{roundsCount != null ? `${roundNumber}/${roundsCount}` : roundNumber}</span>
      </div>
      <div className="chip score">
        <span className="caption">{stat?.caption ?? t('game.points')}</span>
        <span className="value">{stat?.value ?? formatScore(totalScore, locale)}</span>
      </div>
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>{t('game.exitTitle')}</DialogTitle>
        <DialogContent>{exitMessage ?? t('game.exitDefault')}</DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <GameButton color="ghost" size="small" onClick={() => setConfirmExit(false)}>
            {t('game.keepPlaying')}
          </GameButton>
          <GameButton color="magenta" size="small" onClick={() => (onExit ? onExit() : router.push('/play'))}>
            {t('game.exit')}
          </GameButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
