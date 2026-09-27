'use client'

import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getGameModeConfig } from '@/app/(protected)/(game)/models/GameMode'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'

/** Heads-up display of the play screen: exit, mode, round counter and total score. */
export default function RoundHud({ game, roundNumber }: { game: GameView; roundNumber: number }) {
  const router = useRouter()
  const [confirmExit, setConfirmExit] = useState(false)
  const mode = getGameModeConfig(game.mode)

  return (
    <div className="round-hud">
      <IconButton className="exit" onClick={() => setConfirmExit(true)} aria-label="Salir de la partida">
        <CloseIcon />
      </IconButton>
      <div className="chip mode">{mode.name}</div>
      <div className="spacer" />
      <div className="chip round">
        <span className="caption">Ronda</span>
        <span className="value">
          {roundNumber}/{game.roundsCount}
        </span>
      </div>
      <div className="chip score">
        <span className="caption">Puntos</span>
        <span className="value">{formatScore(game.totalScore)}</span>
      </div>
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>¿Salir de la partida?</DialogTitle>
        <DialogContent>La partida queda guardada: podés retomarla desde el menú principal.</DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <GameButton color="ghost" size="small" onClick={() => setConfirmExit(false)}>
            Seguir jugando
          </GameButton>
          <GameButton color="magenta" size="small" onClick={() => router.push('/home')}>
            Salir
          </GameButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
