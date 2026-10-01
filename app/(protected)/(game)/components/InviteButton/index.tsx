'use client'

import ShareIcon from '@mui/icons-material/Share'
import GameButton from '@/app/components/GameButton'
import { useNotifications } from '@/app/hooks/useNotifications'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Invites friends to a multiplayer game: shares the invitation link with the
 * system share sheet (phones), or copies it to the clipboard.
 */
export default function InviteButton({ code, className }: { code: string; className?: string }) {
  const t = useT()
  const { showSuccessMessage, showErrorMessage } = useNotifications()

  const handleInvite = async () => {
    const url = `${window.location.origin}/join/${code}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GeoQuests', text: t('invitation.share', { code }), url })

        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      showSuccessMessage(t('invitation.linkCopied'))
    } catch {
      showErrorMessage(t('invitation.copyFailed', { code }))
    }
  }

  return (
    <GameButton color="cyan" fullWidth startIcon={<ShareIcon />} onClick={handleInvite} className={className}>
      {t('invitation.inviteFriends')}
    </GameButton>
  )
}
