'use client'

import './index.scss'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Link from 'next/link'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { getGameModeConfig } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GamePanel from '@/app/components/GamePanel'
import { useLoadingData } from '@/app/hooks/useLoadingData'

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
})

/** Latest games of the player: finished ones open their summary, unfinished ones can be resumed. */
export default function RecentGames() {
  const { getRecentGames } = useGames()
  const { data: games, loading } = useLoadingData(getRecentGames, [getRecentGames], [])

  return (
    <GamePanel className="recent-games" title="Últimas partidas" accent="cyan">
      {loading && <p className="empty">Cargando...</p>}
      {!loading && games.length === 0 && <p className="empty">Todavía no jugaste ninguna partida. ¡Arrancá!</p>}
      <ul className="list">
        {games.map((game) => {
          const finished = game.status === GameStatus.FINISHED

          return (
            <li key={game.id}>
              <Link href={finished ? `/game/${game.id}/summary` : `/game/${game.id}`} className="item">
                <div className="info">
                  <span className="mode">{getGameModeConfig(game.mode).name}</span>
                  <span className="date">{dateFormatter.format(new Date(game.createdAt))}</span>
                </div>
                {finished ? (
                  <span className="score">{formatScore(game.totalScore)}</span>
                ) : (
                  <span className="resume">
                    Seguir ({game.playedRounds}/{game.roundsCount})
                  </span>
                )}
                <ChevronRightIcon className="chevron" />
              </Link>
            </li>
          )
        })}
      </ul>
    </GamePanel>
  )
}
