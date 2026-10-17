'use client'

import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import MapArt from '@/app/(protected)/(game)/components/MapArt'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { getMapDescription, getMapName } from '@/app/(protected)/(game)/utils/mapText'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'

interface MapCardProps {
  map: MapView
  /** Game mode chosen by the player: the card starts a game of it in this map. */
  mode: GameModeView
  /** Rules chosen by the player in the map picker. */
  settings?: GameSettingsInput
  /** Multiplayer games: listed for everybody, who can join without the code. */
  isPublic?: boolean
}

/**
 * Card of a map in the map picker of a game mode: its image and its number of
 * places. Like the game mode cards, the whole card is the button: it starts a
 * game of the mode in this map.
 */
export default function MapCard({ map, mode, settings, isPublic = false }: MapCardProps) {
  const t = useT()
  const router = useRouter()
  const { createGame } = useGames()
  const [starting, setStarting] = useState(false)
  const multiplayer = mode.maxPlayers > 1

  const handlePlay = async () => {
    if (starting) {
      return
    }

    setStarting(true)

    try {
      const game = await createGame(map.id, mode.mode, settings, isPublic)

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handlePlay()
    }
  }

  return (
    // A div and not a <button>: the card has headings and the map art inside.
    <div
      role="button"
      tabIndex={0}
      aria-busy={starting}
      className={classNames('map-card', { multi: multiplayer, starting })}
      onClick={handlePlay}
      onKeyDown={handleKeyDown}
    >
      {/* In the body: inside the card (moved up by a transform on hover) the
          fixed overlay would only cover the card, not the whole screen. */}
      {starting &&
        createPortal(
          <div className="map-card-loading">
            <Loading message={multiplayer ? t('picker.preparingRoom') : t('picker.searchingPlaces')} />
          </div>,
          document.body
        )}
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
        <span className="cta">
          {t('modes.choose')} <ArrowForwardIcon fontSize="small" />
        </span>
      </div>
    </div>
  )
}
