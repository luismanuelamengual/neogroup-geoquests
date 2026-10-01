'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import MapArt from '@/app/(protected)/(game)/components/MapArt'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { localizeMapDescription, localizeMapName } from '@/app/(protected)/(game)/utils/mapText'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'

interface MapCardProps {
  map: MapView
  /** Game mode chosen by the player: the card starts a game of it in this map. */
  mode: GameModeView
}

/** Card of a map in the map picker of a game mode: its image, its number of places and the button to play it. */
export default function MapCard({ map, mode }: MapCardProps) {
  const t = useT()
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
      {starting && <Loading message={multiplayer ? t('picker.preparingRoom') : t('picker.searchingPlaces')} />}
      <div className="art" aria-hidden="true">
        {map.image && map.photos.length === 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={map.image} alt="" className="image" />
        ) : (
          <MapArt mapId={map.id} shape={map.shape} photos={map.photos} />
        )}
      </div>
      <div className="content">
        <h2 className="name">{localizeMapName(t, map.name)}</h2>
        <p className="description">{localizeMapDescription(t, map.name, map.description)}</p>
        <div className="tags">
          <span className="tag">{t('picker.places', { count: map.placesCount })}</span>
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
          {multiplayer ? t('picker.createRoom') : t('picker.play')}
        </GameButton>
      </div>
    </div>
  )
}
