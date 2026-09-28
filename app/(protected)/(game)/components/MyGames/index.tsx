'use client'

import './index.scss'
import { useCallback, useEffect, useState } from 'react'
import GameListRow from '@/app/(protected)/(game)/components/GameListRow'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameListItem } from '@/app/(protected)/(game)/models/GameView'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'

const PAGE_SIZE = 20

/** "Mis partidas": the player's whole history, newest first, loaded 20 at a time. */
interface MyGamesProps {
  stats: PlayerStats
}

export default function MyGames({ stats }: MyGamesProps) {
  const { getGames } = useGames()
  const [games, setGames] = useState<GameListItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const loadPage = useCallback(
    async (offset: number) => {
      setLoading(true)

      try {
        const page = await getGames(offset, PAGE_SIZE)

        setGames((current) => (offset === 0 ? page.items : [...current, ...page.items]))
        setHasMore(page.hasMore)
      } catch {
        // The error toast is shown by useRequests.
      } finally {
        setLoading(false)
      }
    },
    [getGames]
  )

  useEffect(() => {
    loadPage(0)
  }, [loadPage])

  return (
    <div className="my-games">
      <GamePanel title="Mis partidas" accent="cyan">
        <div className="stats">
          <div className="stat">
            <span className="value">{stats.gamesPlayed}</span>
            <span className="label">Partidas</span>
          </div>
          <div className="stat">
            <span className="value">{formatScore(stats.bestScore)}</span>
            <span className="label">Mejor puntaje</span>
          </div>
          <div className="stat">
            <span className="value">{formatScore(stats.averageScore)}</span>
            <span className="label">Promedio</span>
          </div>
        </div>
        {!loading && games.length === 0 && (
          <div className="empty">
            <p>Todavía no jugaste ninguna partida.</p>
            <GameButton href="/home">¡A jugar!</GameButton>
          </div>
        )}
        <ul className="list">
          {games.map((game) => (
            <li key={game.id}>
              <GameListRow game={game} detailed />
            </li>
          ))}
        </ul>
        {loading && <p className="loading-more">Cargando...</p>}
        {!loading && hasMore && (
          <GameButton color="ghost" fullWidth className="load-more" onClick={() => loadPage(games.length)}>
            Cargar más
          </GameButton>
        )}
      </GamePanel>
    </div>
  )
}
