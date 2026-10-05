'use client'

import './index.scss'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import MusicOffIcon from '@mui/icons-material/MusicOff'
import IconButton from '@mui/material/IconButton'
import { useT } from '@/app/i18n/I18nProvider'
import { useMusicStore } from '@/app/stores/music'

/**
 * On/off button of the background music (see BackgroundMusic, which plays it).
 * Not shown when there are no tracks. The choice is remembered in localStorage.
 */
export default function MusicToggle() {
  const t = useT()
  const enabled = useMusicStore((state) => state.enabled)
  const toggle = useMusicStore((state) => state.toggle)
  const hasTracks = useMusicStore((state) => state.tracks.length > 0)

  if (!hasTracks) {
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
