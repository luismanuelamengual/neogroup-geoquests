'use client'

import ShareIcon from '@mui/icons-material/Share'
import GameButton from '@/app/components/GameButton'
import { useNotifications } from '@/app/hooks/useNotifications'

/**
 * Invites friends to a multiplayer game: shares the invitation link with the
 * system share sheet (phones), or copies it to the clipboard.
 */
export default function InviteButton({ code, className }: { code: string; className?: string }) {
  const { showSuccessMessage, showErrorMessage } = useNotifications()

  const handleInvite = async () => {
    const url = `${window.location.origin}/join/${code}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GeoQuests', text: `¡Jugá conmigo a GeoQuests! Código: ${code}`, url })

        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      showSuccessMessage('¡Link copiado! Pasáselo a tus amigos.')
    } catch {
      showErrorMessage(`No pudimos copiar el link. El código de la partida es ${code}.`)
    }
  }

  return (
    <GameButton color="cyan" fullWidth startIcon={<ShareIcon />} onClick={handleInvite} className={className}>
      Invitar amigos
    </GameButton>
  )
}
