'use client'

import './index.scss'
import BoltIcon from '@mui/icons-material/Bolt'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import MapArt from '@/app/(protected)/(game)/components/MapArt'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { QuickPlayView } from '@/app/(protected)/(game)/models/QuickPlayView'
import { localizeMapDescription, localizeMapName } from '@/app/(protected)/(game)/utils/mapText'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Main menu card of a quick game: a single player classic game with fixed
 * rules in a fixed map, which starts right away (no map picker, no rules).
 */
export default function QuickPlayCard({ quickPlay }: { quickPlay: QuickPlayView }) {
  const t = useT()
  const router = useRouter()
  const { createGame } = useGames()
  const [starting, setStarting] = useState(false)
  const { map, mode, settings } = quickPlay

  const handlePlay = async () => {
    setStarting(true)

    try {
      const game = await createGame(map.id, mode, settings)

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="quick-play">
      {starting && <Loading message={t('picker.searchingPlaces')} />}
      <button type="button" className="quick-play-card" disabled={starting} onClick={handlePlay}>
        <span className="art" aria-hidden="true">
          {map.image && map.photos.length === 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={map.image} alt="" className="image" />
          ) : (
            <MapArt mapId={map.id} shape={map.shape} photos={map.photos} />
          )}
          <span className="badge">
            <BoltIcon className="icon" />
          </span>
        </span>
        <span className="content">
          <span className="name">{t('home.quickPlay')}</span>
          <span className="map">{localizeMapName(t, map.name)}</span>
          <span className="description">{localizeMapDescription(t, map.name, map.description)}</span>
          <span className="tags">
            <span className="tag">{t('modes.rounds', { count: settings.rounds })}</span>
            <span className="tag">
              {settings.timeLimitSeconds
                ? t('modes.timePerRound', { time: formatTimeLimit(settings.timeLimitSeconds, t) })
                : t('modes.noTime')}
            </span>
          </span>
          <span className="cta">
            {t('home.playNow')} <PlayArrowIcon fontSize="small" />
          </span>
        </span>
      </button>
    </div>
  )
}
