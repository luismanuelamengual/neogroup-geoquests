'use client'

import { useEffect, useState } from 'react'

/**
 * Whether the countdown that opens a round is running. It runs at most once per
 * round: after it ended it never comes back, however the game is refreshed
 * (every refresh moves `startsAt` to the device's "now", and a late tick of the
 * clock could otherwise bring the countdown back for a moment).
 */
export function useRoundCountdown(
  guessing: boolean,
  roundNumber: number,
  countdownMs: number,
  startsAt: number,
  now: number
): boolean {
  const [endedRound, setEndedRound] = useState(0)
  const running = guessing && countdownMs > 0 && now < startsAt
  const ended = guessing && !running

  useEffect(() => {
    if (ended) {
      setEndedRound(roundNumber)
    }
  }, [ended, roundNumber])

  return running && endedRound !== roundNumber
}
