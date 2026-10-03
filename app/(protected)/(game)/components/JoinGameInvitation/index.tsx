'use client'

import './index.scss'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { MULTIPLAYER_MENU_PATH } from '@/app/(protected)/(game)/utils/modeRoutes'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Landing of an invitation link (/join/[code]): the player confirms before
 * joining — opening (or prefetching) the link never joins by itself.
 */
export default function JoinGameInvitation({ code }: { code: string }) {
  const t = useT()
  const router = useRouter()
  const { joinGame } = useGames()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    setJoining(true)
    setError(null)

    try {
      const game = await joinGame(code)

      router.replace(`/game/${game.id}`)
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : t('invitation.joinFailed'))
      setJoining(false)
    }
  }

  return (
    <div className="join-game-invitation">
      <GamePanel className="panel" title={t('invitation.title')} accent="magenta">
        <p className="text">{t('invitation.text')}</p>
        <div className="code">{code}</div>
        {error && <p className="error">{error}</p>}
        <GameButton size="large" fullWidth startIcon={<GroupAddIcon />} loading={joining} onClick={handleJoin}>
          {t('invitation.join')}
        </GameButton>
        <GameButton color="ghost" fullWidth href={MULTIPLAYER_MENU_PATH}>
          {t('invitation.goToMenu')}
        </GameButton>
      </GamePanel>
    </div>
  )
}
