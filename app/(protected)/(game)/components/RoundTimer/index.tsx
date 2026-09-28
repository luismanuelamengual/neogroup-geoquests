'use client'

import './index.scss'
import TimerIcon from '@mui/icons-material/Timer'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { formatClock } from '@/app/(protected)/(game)/utils/score'

/** Seconds under which the clock turns red and pulses. */
const HURRY_SECONDS = 10

interface RoundTimerProps {
  /** When the time runs out (epoch ms, this device's clock). */
  deadline: number
  /** Called once, when the countdown reaches 0. */
  onExpire: () => void
}

/** Countdown of the current round. Turns red in the last seconds and calls `onExpire` at 0. */
export default function RoundTimer({ deadline, onExpire }: RoundTimerProps) {
  const [now, setNow] = useState(() => Date.now())
  const onExpireRef = useRef(onExpire)
  const expiredRef = useRef(false)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    expiredRef.current = false

    const interval = window.setInterval(() => {
      const current = Date.now()

      setNow(current)

      if (current >= deadline && !expiredRef.current) {
        expiredRef.current = true
        window.clearInterval(interval)
        onExpireRef.current()
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [deadline])

  const left = Math.max(0, deadline - now)

  return (
    <div className={classNames('round-timer', { hurry: left <= HURRY_SECONDS * 1000 })} role="timer">
      <TimerIcon className="icon" />
      <span className="value">{formatClock(left)}</span>
    </div>
  )
}
