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
import GameButton, { type GameButtonSize } from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * "Unirme con código": button of the multiplayer menu that asks for the code
 * of a friend's game and joins it, whatever its mode. Cyan, the color of the
 * multiplayer games (see utils/modeColor.ts).
 */
export default function JoinGameDialog({ className, size }: { className?: string; size?: GameButtonSize }) {
  const t = useT()
  const router = useRouter()
  const { joinGame } = useGames()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const color = 'cyan'
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
      <GameButton
        color={color}
        size={size}
        startIcon={<GroupAddIcon />}
        className={className}
        onClick={() => setOpen(true)}
      >
        {t('picker.joinWithCode')}
      </GameButton>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{t('picker.joinTitle')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label={t('picker.codeLabel')}
              placeholder={t('picker.codePlaceholder')}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              slotProps={{ htmlInput: { maxLength: GAME_CODE_LENGTH + 2, autoCapitalize: 'characters' } }}
            />
          </DialogContent>
          <DialogActions sx={{ gap: 1, p: 2 }}>
            <GameButton color="ghost" size="small" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </GameButton>
            <GameButton type="submit" size="small" color={color} disabled={!validCode} loading={joining}>
              {t('picker.join')}
            </GameButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
