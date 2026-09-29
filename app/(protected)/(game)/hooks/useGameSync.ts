'use client'

import { useEffect, useRef } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'

/** Time between two polls while everything goes well. */
const POLL_INTERVAL_MS = 1500
/** Longest wait between polls after consecutive errors (backoff). */
const MAX_BACKOFF_MS = 10_000

/**
 * Keeps the game of the game store in sync with the server while `enabled`
 * (real time modes): polls /api/getGame every POLL_INTERVAL_MS with the
 * version it has (the server answers "unchanged" when nothing happened),
 * pauses while the tab is hidden and polls right away when it comes back.
 * After an error it waits longer each time; `onError` gets every error (e.g.
 * the player was removed from the game).
 */
export function useGameSync(gameId: number, enabled: boolean, onError?: (error: Error) => void) {
  const { getGame } = useGames()
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let timer: number | undefined
    let stopped = false
    let failures = 0
    let polling = false

    const schedule = (delay: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(poll, delay)
    }

    async function poll() {
      if (stopped || polling) {
        return
      }

      if (document.hidden) {
        // Resumed by the visibilitychange listener.
        return
      }

      polling = true

      try {
        const current = useGameStore.getState().game
        const response = await getGame(gameId, current?.id === gameId ? current.version : null)

        if (!stopped && !response.unchanged) {
          useGameStore.getState().setGame(response.game)
        }

        failures = 0
      } catch (error) {
        failures++
        onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)))
      } finally {
        polling = false
      }

      if (!stopped) {
        schedule(Math.min(POLL_INTERVAL_MS * 2 ** failures, MAX_BACKOFF_MS))
      }
    }

    const handleVisibility = () => {
      if (!document.hidden) {
        schedule(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    schedule(POLL_INTERVAL_MS)

    return () => {
      stopped = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [gameId, enabled, getGame])
}
