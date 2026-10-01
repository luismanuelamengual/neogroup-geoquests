'use client'

import './index.scss'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import MusicOffIcon from '@mui/icons-material/MusicOff'
import IconButton from '@mui/material/IconButton'
import { useEffect, useState } from 'react'
import { useBackgroundMusic } from '@/app/(protected)/(game)/hooks/useBackgroundMusic'
import { useT } from '@/app/i18n/I18nProvider'
import { useMusicStore } from '@/app/stores/music'

/**
 * Background music of the play screen plus its on/off button. The tracks are
 * the ones in public/music (see /api/getMusicTracks); the button is not shown
 * when there are none. The choice is remembered in localStorage.
 */
export default function MusicToggle() {
  const t = useT()
  const enabled = useMusicStore((state) => state.enabled)
  const toggle = useMusicStore((state) => state.toggle)
  const hydrate = useMusicStore((state) => state.hydrate)
  const [tracks, setTracks] = useState<string[]>([])

  useBackgroundMusic(tracks, enabled)

  useEffect(() => {
    let cancelled = false

    hydrate()
    fetch('/api/getMusicTracks')
      .then((response) => (response.ok ? response.json() : { tracks: [] }))
      .then((data: { tracks?: string[] }) => {
        if (!cancelled) {
          setTracks(data.tracks ?? [])
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [hydrate])

  if (tracks.length === 0) {
    return null
  }

  return (
    <IconButton
      className={`music-toggle${enabled ? ' on' : ''}`}
      onClick={toggle}
      aria-label={enabled ? t('game.musicOff') : t('game.musicOn')}
      aria-pressed={enabled}
      title={enabled ? t('game.musicOff') : t('game.musicOn')}
    >
      {enabled ? <MusicNoteIcon fontSize="small" /> : <MusicOffIcon fontSize="small" />}
    </IconButton>
  )
}
