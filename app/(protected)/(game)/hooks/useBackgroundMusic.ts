import { useEffect, useRef } from 'react'

const VOLUME = 0.12

/**
 * Plays the tracks in a loop: starts with a random one and goes on in order,
 * coming back to the first after the last. A track that fails to load is
 * skipped. While `enabled` is false (or the page is hidden) it is paused, and
 * resumes where it was. If the browser blocks autoplay (no user interaction
 * with the page yet) it starts on the first click / key press.
 */
export function useBackgroundMusic(tracks: string[], enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (tracks.length === 0) {
      return
    }

    const audio = new Audio()
    let index = Math.floor(Math.random() * tracks.length)
    let failures = 0

    audio.volume = VOLUME
    audio.preload = 'auto'
    audio.src = tracks[index]

    const playNext = () => {
      index = (index + 1) % tracks.length
      audio.src = tracks[index]
      audio.play().catch(() => undefined)
    }

    const handleError = () => {
      // Give up when every track failed in a row.
      if (++failures < tracks.length) {
        playNext()
      }
    }

    const handlePlaying = () => {
      failures = 0
    }

    audio.addEventListener('ended', playNext)
    audio.addEventListener('error', handleError)
    audio.addEventListener('playing', handlePlaying)
    audioRef.current = audio

    return () => {
      audio.removeEventListener('ended', playNext)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('playing', handlePlaying)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    let removeGestureListeners = () => {}

    const play = () => {
      removeGestureListeners()

      audio.play().catch(() => {
        // Autoplay blocked: try again on the first interaction.
        const retry = () => {
          removeGestureListeners()
          audio.play().catch(() => undefined)
        }

        window.addEventListener('pointerdown', retry, { once: true })
        window.addEventListener('keydown', retry, { once: true })

        removeGestureListeners = () => {
          window.removeEventListener('pointerdown', retry)
          window.removeEventListener('keydown', retry)
        }
      })
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.pause()
      } else if (enabled) {
        play()
      }
    }

    if (enabled && !document.hidden) {
      play()
    } else {
      audio.pause()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      removeGestureListeners()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // `tracks`: the audio element (audioRef) is created when they load.
  }, [enabled, tracks])
}
