'use client'

import '@/app/(protected)/(game)/components/RoundHud/index.scss'
import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import MusicToggle from '@/app/(protected)/(game)/components/MusicToggle'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { formatCaseTime, formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Heads-up display of a detective game: exit, where the detective is, the
 * fictional clock, the time left (red when little is left, or not enough for a witness) and the
 * destination being followed.
 */
export default function DetectiveHud({ view }: { view: DetectiveGameView }) {
  const t = useT()
  const router = useRouter()
  const [confirmExit, setConfirmExit] = useState(false)
  const left = Math.max(0, view.timeLimitMinutes - view.elapsedMinutes)
  const ratio = left / view.timeLimitMinutes
  const location = view.currentStage?.location

  return (
    <div className="round-hud detective-hud">
      <IconButton className="exit" onClick={() => setConfirmExit(true)} aria-label={t('game.exitAria')}>
        <CloseIcon />
      </IconButton>
      {location && (
        <div className="chip location">
          <span className="caption">{t('detective.play.youAreIn')}</span>
          <span className="value">
            {countryFlag(location.countryCode)} {location.placeName}
          </span>
        </div>
      )}
      <MusicToggle />
      <div className="spacer" />
      <div className="chip clock">
        <span className="caption">{t('detective.play.clock')}</span>
        <span className="value">
          {/* The short one ("mié 10:30") only on the narrowest phones. */}
          <span className="long">{formatCaseTime(t, view.elapsedMinutes)}</span>
          <span className="short">{formatCaseTime(t, view.elapsedMinutes, { short: true })}</span>
        </span>
      </div>
      <div className={classNames('chip time-left', { low: ratio < 0.2 || left < view.witnessMinutes })}>
        <span className="caption">{t('detective.play.timeLeft')}</span>
        <span className="value">{formatDuration(left)}</span>
        <span className="bar" aria-hidden="true">
          <span className="fill" style={{ width: `${ratio * 100}%` }} />
        </span>
      </div>
      <div className="chip round">
        <span className="caption">{t('detective.play.destination')}</span>
        <span className="value">
          {view.currentStageNumber ?? view.stagesCount}/{view.stagesCount}
        </span>
      </div>
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>{t('game.exitTitle')}</DialogTitle>
        <DialogContent>{t('detective.play.exitMessage')}</DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <GameButton color="ghost" size="small" onClick={() => setConfirmExit(false)}>
            {t('game.keepPlaying')}
          </GameButton>
          <GameButton color="magenta" size="small" onClick={() => router.push('/play')}>
            {t('game.exit')}
          </GameButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
