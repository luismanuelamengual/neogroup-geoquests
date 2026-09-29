'use client'

import './index.scss'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'

interface RoundCountdownProps {
  /** When the round starts (epoch ms, this device's clock). */
  startsAt: number
  roundNumber: number
  roundsCount: number
}

/** Full-screen "3, 2, 1" before a multiplayer round starts (the same moment for everybody). */
export default function RoundCountdown({ startsAt, roundNumber, roundsCount }: RoundCountdownProps) {
  const now = useNow(100)
  const seconds = Math.ceil((startsAt - now) / 1000)

  if (seconds <= 0) {
    return null
  }

  return (
    <div className="round-countdown">
      <div className="round">
        Ronda {roundNumber} de {roundsCount}
      </div>
      <div key={seconds} className="number">
        {seconds}
      </div>
    </div>
  )
}
