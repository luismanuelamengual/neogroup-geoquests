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
  mapName: string | null
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

const DEFAULT_EXIT_MESSAGE =
  'La partida queda guardada: podés retomarla desde el menú principal. Si la ronda tiene tiempo, el reloj sigue corriendo.'

/** Heads-up display of the play screen: exit, map, round countdown, round counter and total score. */
export default function RoundHud({
  mapName,
  roundNumber,
  roundsCount,
  totalScore = 0,
  stat,
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
      <div className="chip map">{mapName}</div>
      <div className="spacer" />
      {timer}
      <div className="chip round">
        <span className="caption">Ronda</span>
        <span className="value">{roundsCount != null ? `${roundNumber}/${roundsCount}` : roundNumber}</span>
      </div>
      <div className="chip score">
        <span className="caption">{stat?.caption ?? 'Puntos'}</span>
        <span className="value">{stat?.value ?? formatScore(totalScore)}</span>
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
