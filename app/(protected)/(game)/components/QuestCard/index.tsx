'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

interface QuestCardProps {
  quest: QuestView
  /** Game mode chosen by the player: the card shows its rules for this quest and starts a game of it. */
  mode: GameMode
}

/** Card of a quest in the quest picker of a game mode: its image, the mode's rules and the button to play it. */
export default function QuestCard({ quest, mode }: QuestCardProps) {
  const router = useRouter()
  const { createGame } = useGames()
  const [starting, setStarting] = useState(false)
  const questMode = quest.modes.find((item) => item.mode === mode)

  if (!questMode) {
    return null
  }

  const { rounds, timeLimitSeconds } = questMode.settings
  const multiplayer = questMode.maxPlayers > 1

  const handlePlay = async () => {
    setStarting(true)

    try {
      const game = await createGame(quest.id, mode)

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="quest-card">
      {starting && <Loading message={multiplayer ? 'Preparando la sala...' : 'Buscando lugares por el mundo...'} />}
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
          <span className="tag">{rounds} rondas</span>
          <span className="tag">
            {timeLimitSeconds ? `${formatTimeLimit(timeLimitSeconds)} por ronda` : 'Sin tiempo'}
          </span>
          {quest.placesCount > 1 && <span className="tag">{quest.placesCount} lugares</span>}
        </div>
        <GameButton
          size="large"
          fullWidth
          className="play"
          color={multiplayer ? 'cyan' : 'gold'}
          startIcon={<GameModeIcon mode={mode} />}
          loading={starting}
          onClick={handlePlay}
        >
          {multiplayer ? 'Crear sala' : 'Jugar'}
        </GameButton>
      </div>
    </div>
  )
}
