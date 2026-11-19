'use client'

import { useEffect, useState } from 'react'
import { useFocusDetector } from '@/app/hooks/useFocusDetector'

/**
 * Grace period of the anti-cheat: a loss of focus shorter than this is taken as
 * if the focus had never been lost (there are spurious micro losses of focus).
 */
export const FOCUS_LOSS_GRACE_MS = 5000

/** No loss of focus outlasted the grace period. */
const NONE = Symbol('none')

/**
 * Anti-cheat: whether the window has been without focus for more than
 * FOCUS_LOSS_GRACE_MS in a row while `active`. Getting the focus back before
 * that resets it, as does becoming inactive (e.g. the round or the game ended)
 * or a change of `key` (e.g. a new round): the countdown starts over.
 */
export function useSustainedFocusLoss(active: boolean, key?: unknown): boolean {
  const focused = useFocusDetector()
  /** The key under which the focus was lost for longer than the grace period. */
  const [lostKey, setLostKey] = useState<unknown>(NONE)
  const watching = active && !focused

  useEffect(() => {
    if (!watching) {
      return
    }

    const timer = window.setTimeout(() => setLostKey(key), FOCUS_LOSS_GRACE_MS)

    return () => {
      window.clearTimeout(timer)
      setLostKey(NONE)
    }
  }, [watching, key])

  return watching && lostKey === key
}
