'use client'

import './index.scss'
import Link from 'next/link'
import { useCallback } from 'react'
import GameListRow from '@/app/(protected)/(game)/components/GameListRow'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import GamePanel from '@/app/components/GamePanel'
import { useLoadingData } from '@/app/hooks/useLoadingData'

const RECENT_GAMES = 5

/** Main menu panel with the latest games of the player and a link to the full history. */
export default function RecentGames() {
  const { getGames } = useGames()
  const loadRecent = useCallback(() => getGames(0, RECENT_GAMES), [getGames])
  const { data, loading } = useLoadingData(loadRecent, [loadRecent], { items: [], hasMore: false })

  return (
    <GamePanel className="recent-games" title="Últimas partidas" accent="cyan">
      {loading && <p className="empty">Cargando...</p>}
      {!loading && data.items.length === 0 && <p className="empty">Todavía no jugaste ninguna partida. ¡Arrancá!</p>}
      <ul className="list">
        {data.items.map((game) => (
          <li key={game.id}>
            <GameListRow game={game} />
          </li>
        ))}
      </ul>
      {data.items.length > 0 && (
        <Link href="/games" className="text-link see-all">
          Ver todas mis partidas →
        </Link>
      )}
    </GamePanel>
  )
}
