'use client'

import { useEffect } from 'react'
import { useBackgroundMusic } from '@/app/(protected)/(game)/hooks/useBackgroundMusic'
import { useMusicStore } from '@/app/stores/music'

/**
 * Plays the background music (the tracks in public/music, see /api/getMusicTracks)
 * while it is mounted. It shows nothing: mount it once per play screen, outside
 * the parts that change during the game, so the music is not cut between them.
 */
export default function BackgroundMusic() {
  const enabled = useMusicStore((state) => state.enabled)
  const tracks = useMusicStore((state) => state.tracks)
  const hydrate = useMusicStore((state) => state.hydrate)
  const loadTracks = useMusicStore((state) => state.loadTracks)

  useBackgroundMusic(tracks, enabled)

  useEffect(() => {
    hydrate()
    loadTracks()
  }, [hydrate, loadTracks])

  return null
}
