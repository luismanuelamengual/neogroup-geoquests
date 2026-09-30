'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

interface MapCardProps {
  map: MapView
  /** Game mode chosen by the player: the card starts a game of it in this map. */
  mode: GameModeView
}

/** Card of a map in the map picker of a game mode: its image, its number of places and the button to play it. */
export default function MapCard({ map, mode }: MapCardProps) {
  const router = useRouter()
  const { createGame } = useGames()
  const [starting, setStarting] = useState(false)
  const multiplayer = mode.maxPlayers > 1

  const handlePlay = async () => {
    setStarting(true)

    try {
      const game = await createGame(map.id, mode.mode)

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="map-card">
      {starting && <Loading message={multiplayer ? 'Preparando la sala...' : 'Buscando lugares por el mundo...'} />}
      <div className="art" aria-hidden="true">
        {map.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={map.image} alt="" className="image" />
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
        <h2 className="name">{map.name}</h2>
        <p className="description">{map.description}</p>
        <div className="tags">
          <span className="tag">
            {map.placesCount} {map.placesCount === 1 ? 'lugar' : 'lugares'}
          </span>
        </div>
        <GameButton
          size="large"
          fullWidth
          className="play"
          color={multiplayer ? 'cyan' : 'gold'}
          startIcon={<GameModeIcon mode={mode.mode} />}
          loading={starting}
          onClick={handlePlay}
        >
          {multiplayer ? 'Crear sala' : 'Jugar'}
        </GameButton>
      </div>
    </div>
  )
}
