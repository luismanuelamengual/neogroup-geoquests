'use client'

import './index.scss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'
import { saveGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

/** Main menu card of a quest: its image, rules and the button that starts a new game. */
export default function QuestCard({ quest }: { quest: QuestView }) {
  const router = useRouter()
  const { startGame } = useGames()
  const [starting, setStarting] = useState(false)

  const handlePlay = async () => {
    setStarting(true)

    try {
      const session = await startGame(quest.id)

      saveGameSession(session)
      router.push(`/game/${session.game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="quest-card">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <div className="art" aria-hidden="true">
        {quest.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={quest.image} alt="" className="image" />
        ) : (
          <>
            <div className="sun" />
            <div className="skyline">
              {Array.from({ length: 11 }, (_, index) => (
                <span key={index} className={`building b${index}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="content">
        <h2 className="name">{quest.name}</h2>
        <p className="description">{quest.description}</p>
        <div className="tags">
          <span className="tag">{quest.rounds} rondas</span>
          <span className="tag">{quest.time ? `${formatTimeLimit(quest.time)} por ronda` : 'Sin tiempo'}</span>
          <span className="tag">{quest.placesCount} lugares</span>
        </div>
        <GameButton size="large" fullWidth startIcon={<PlayArrowIcon />} loading={starting} onClick={handlePlay}>
          Jugar
        </GameButton>
      </div>
    </div>
  )
}
