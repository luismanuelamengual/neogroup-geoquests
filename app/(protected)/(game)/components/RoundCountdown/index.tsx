'use client'

import './index.scss'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'

interface RoundCountdownProps {
  /** When the round starts (epoch ms, this device's clock). */
  startsAt: number
  roundNumber: number
  /** Rounds of the game (null when not known beforehand, e.g. battle royale). */
  roundsCount?: number | null
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
        {roundsCount != null ? `Ronda ${roundNumber} de ${roundsCount}` : `Ronda ${roundNumber}`}
      </div>
      <div key={seconds} className="number">
        {seconds}
      </div>
    </div>
  )
}
