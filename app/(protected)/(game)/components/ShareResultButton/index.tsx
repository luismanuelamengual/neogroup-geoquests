'use client'

import ShareIcon from '@mui/icons-material/Share'
import GameButton, { GameButtonColor } from '@/app/components/GameButton'
import { useNotifications } from '@/app/hooks/useNotifications'
import { useT } from '@/app/i18n/I18nProvider'

interface ShareResultButtonProps {
  /** The text to share (see utils/share.ts). */
  text: string
  color?: GameButtonColor
}

/** Shares the result of a game: the share sheet of the device or, where there is none, the clipboard. */
export default function ShareResultButton({ text, color = 'cyan' }: ShareResultButtonProps) {
  const t = useT()
  const { showSuccessMessage, showErrorMessage } = useNotifications()

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text })

        return
      } catch (error) {
        // Closing the share sheet is not an error.
        if ((error as Error).name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      showSuccessMessage(t('share.copied'))
    } catch {
      showErrorMessage(t('share.failed'))
    }
  }

  return (
    <GameButton color={color} size="large" startIcon={<ShareIcon />} onClick={handleShare}>
      {t('share.button')}
    </GameButton>
  )
}
