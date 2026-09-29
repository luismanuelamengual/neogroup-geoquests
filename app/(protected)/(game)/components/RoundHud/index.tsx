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
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'

interface RoundHudProps {
  questName: string | null
  roundNumber: number
  roundsCount: number
  totalScore: number
  /** Countdown of the round (timed quests). */
  timer?: ReactNode
  /** What the exit confirmation says (by default: the game stays saved). */
  exitMessage?: string
  /** What exiting does (by default: back to the main menu). */
  onExit?: () => void
}

const DEFAULT_EXIT_MESSAGE =
  'La partida queda guardada: podés retomarla desde el menú principal. Si la ronda tiene tiempo, el reloj sigue corriendo.'

/** Heads-up display of the play screen: exit, quest, round countdown, round counter and total score. */
export default function RoundHud({
  questName,
  roundNumber,
  roundsCount,
  totalScore,
  timer,
  exitMessage = DEFAULT_EXIT_MESSAGE,
  onExit
}: RoundHudProps) {
  const router = useRouter()
  const [confirmExit, setConfirmExit] = useState(false)

  return (
    <div className="round-hud">
      <IconButton className="exit" onClick={() => setConfirmExit(true)} aria-label="Salir de la partida">
        <CloseIcon />
      </IconButton>
      <div className="chip quest">{questName}</div>
      <div className="spacer" />
      {timer}
      <div className="chip round">
        <span className="caption">Ronda</span>
        <span className="value">
          {roundNumber}/{roundsCount}
        </span>
      </div>
      <div className="chip score">
        <span className="caption">Puntos</span>
        <span className="value">{formatScore(totalScore)}</span>
      </div>
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>¿Salir de la partida?</DialogTitle>
        <DialogContent>{exitMessage}</DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <GameButton color="ghost" size="small" onClick={() => setConfirmExit(false)}>
            Seguir jugando
          </GameButton>
          <GameButton color="magenta" size="small" onClick={() => (onExit ? onExit() : router.push('/home'))}>
            Salir
          </GameButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
