'use client'

import './index.scss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameModeConfig } from '@/app/(protected)/(game)/models/GameMode'
import { saveGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

/** Main menu card of a game mode: starts a new game of that mode. */
export default function GameModeCard({ mode }: { mode: GameModeConfig }) {
  const router = useRouter()
  const { startGame } = useGames()
  const [starting, setStarting] = useState(false)

  const handlePlay = async () => {
    setStarting(true)

    try {
      const session = await startGame(mode.mode)

      saveGameSession(session)
      router.push(`/game/${session.game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="game-mode-card">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <div className="art" aria-hidden="true">
        <div className="sun" />
        <div className="skyline">
          {Array.from({ length: 11 }, (_, index) => (
            <span key={index} className={`building b${index}`} />
          ))}
        </div>
      </div>
      <div className="content">
        <h2 className="name">{mode.name}</h2>
        <p className="description">{mode.description}</p>
        <div className="tags">
          <span className="tag">{mode.roundsCount} rondas</span>
          <span className="tag">Hasta {(mode.score.maxScore * mode.roundsCount).toLocaleString('es-AR')} pts</span>
        </div>
        <GameButton size="large" fullWidth startIcon={<PlayArrowIcon />} loading={starting} onClick={handlePlay}>
          Jugar
        </GameButton>
      </div>
    </div>
  )
}
