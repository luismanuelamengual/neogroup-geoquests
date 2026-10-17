'use client'

import { useEffect, useRef } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { useFocusDetector } from '@/app/hooks/useFocusDetector'

/** Time between two polls while everything goes well. */
const POLL_INTERVAL_MS = 1500
/** Longest wait between polls after consecutive errors (backoff). */
const MAX_BACKOFF_MS = 10_000

/**
 * Keeps the game of the game store in sync with the server while `enabled`
 * (real time modes): polls /api/getGame every POLL_INTERVAL_MS with the
 * version it has (the server answers "unchanged" when nothing happened),
 * pauses while the window is not active (hidden tab, focus in another app or
 * window) and polls right away when it comes back.
 * After an error it waits longer each time; `onError` gets every error (e.g.
 * the player was removed from the game).
 */
export function useGameSync(gameId: number, enabled: boolean, onError?: (error: Error) => void) {
  const { getGame } = useGames()
  const onErrorRef = useRef(onError)
  const focused = useFocusDetector()
  /** Whether polling was paused for lack of focus: when it resumes, it polls right away. */
  const pausedRef = useRef(false)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!focused) {
      pausedRef.current = true
    }
  }, [focused])

  useEffect(() => {
    if (!enabled || !focused) {
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

    schedule(pausedRef.current ? 0 : POLL_INTERVAL_MS)
    pausedRef.current = false

    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [gameId, enabled, focused, getGame])
}
