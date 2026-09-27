'use client'

import { useEffect, useState } from 'react'

/** Animates a number from 0 to `target` (ease-out) — used for the score reveals. */
export function useCountUp(target: number, durationMs = 1200, delayMs = 0): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    let start: number | null = null
    const timeout = window.setTimeout(() => {
      const step = (timestamp: number) => {
        start ??= timestamp

        const progress = Math.min(1, (timestamp - start) / durationMs)
        const eased = 1 - Math.pow(1 - progress, 3)

        setValue(Math.round(target * eased))

        if (progress < 1) {
          frame = window.requestAnimationFrame(step)
        }
      }

      frame = window.requestAnimationFrame(step)
    }, delayMs)

    return () => {
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(frame)
    }
  }, [target, durationMs, delayMs])

  return value
}
