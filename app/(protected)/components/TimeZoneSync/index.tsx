'use client'

import { useEffect } from 'react'
import { useAccount } from '@/app/(protected)/(account)/hooks/useAccount'

/**
 * Keeps the time zone of the player up to date (the day of its streak, see
 * utils/streak.ts): sends the browser's one when it is not the stored one.
 */
export default function TimeZoneSync({ timeZone }: { timeZone: string | null }) {
  const { updateAccount } = useAccount()

  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (browserTimeZone && browserTimeZone !== timeZone) {
      updateAccount({ timeZone: browserTimeZone }, false).catch(() => {
        // Not important: the streak uses UTC meanwhile and it is sent again on the next page load.
      })
    }
  }, [timeZone, updateAccount])

  return null
}
