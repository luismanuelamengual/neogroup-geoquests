'use client'

import './index.scss'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import MapArt from '@/app/(protected)/(game)/components/MapArt'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { getMapDescription, getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { getModeColor } from '@/app/(protected)/(game)/utils/modeColor'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'

interface MapCardProps {
  map: MapView
  /** Game mode chosen by the player: the card starts a game of it in this map. */
  mode: GameModeView
  /** Rules chosen by the player in the map picker. */
  settings?: GameSettingsInput
}

/** Card of a map in the map picker of a game mode: its image, its number of places and the button to play it. */
export default function MapCard({ map, mode, settings }: MapCardProps) {
  const t = useT()
  const router = useRouter()
  const { createGame } = useGames()
  const [starting, setStarting] = useState(false)
  const multiplayer = mode.maxPlayers > 1

  const handlePlay = async () => {
    setStarting(true)

    try {
      const game = await createGame(map.id, mode.mode, settings)

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className={classNames('map-card', { multi: multiplayer })}>
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
        <h2 className="name">{getMapName(t, map.slug)}</h2>
        <p className="description">{getMapDescription(t, map.slug)}</p>
        <div className="tags">
          <span className="tag">{t('picker.places', { count: map.placesCount })}</span>
        </div>
        <GameButton
          size="large"
          fullWidth
          className="play"
          color={getModeColor(mode.mode)}
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
