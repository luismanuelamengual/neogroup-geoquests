'use client'

import GroupAddIcon from '@mui/icons-material/GroupAdd'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GAME_CODE_LENGTH, normalizeGameCode } from '@/app/(protected)/(game)/utils/gameCodes'
import GameButton from '@/app/components/GameButton'

/** "Unirme con código": button of the main menu that asks for the code of a friend's game and joins it. */
export default function JoinGameDialog({ className }: { className?: string }) {
  const router = useRouter()
  const { joinGame } = useGames()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const validCode = normalizeGameCode(code)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!validCode) {
      return
    }

    setJoining(true)

    try {
      const game = await joinGame(validCode)

      router.push(`/game/${game.id}`)
    } catch {
      setJoining(false)
    }
  }

  return (
    <>
      <GameButton color="cyan" startIcon={<GroupAddIcon />} className={className} onClick={() => setOpen(true)}>
        Unirme con código
      </GameButton>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Unirme a una partida</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Código de la partida"
              placeholder="Ej: K7QX2M"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              slotProps={{ htmlInput: { maxLength: GAME_CODE_LENGTH + 2, autoCapitalize: 'characters' } }}
            />
          </DialogContent>
          <DialogActions sx={{ gap: 1, p: 2 }}>
            <GameButton color="ghost" size="small" onClick={() => setOpen(false)}>
              Cancelar
            </GameButton>
            <GameButton type="submit" size="small" disabled={!validCode} loading={joining}>
              Unirme
            </GameButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
