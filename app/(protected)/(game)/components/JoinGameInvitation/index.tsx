'use client'

import './index.scss'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'

/**
 * Landing of an invitation link (/join/[code]): the player confirms before
 * joining — opening (or prefetching) the link never joins by itself.
 */
export default function JoinGameInvitation({ code }: { code: string }) {
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
      setError(joinError instanceof Error ? joinError.message : 'No pudimos unirte a la partida.')
      setJoining(false)
    }
  }

  return (
    <div className="join-game-invitation">
      <GamePanel className="panel" title="¡Te invitaron!" accent="magenta">
        <p className="text">Un amigo te invitó a jugar una partida de GeoQuests.</p>
        <div className="code">{code}</div>
        {error && <p className="error">{error}</p>}
        <GameButton size="large" fullWidth startIcon={<GroupAddIcon />} loading={joining} onClick={handleJoin}>
          Unirme a la partida
        </GameButton>
        <GameButton color="ghost" fullWidth href="/play">
          Ir al menú
        </GameButton>
      </GamePanel>
    </div>
  )
}
