'use client'

import './index.scss'
import GameModeCard from '@/app/(protected)/(game)/components/GameModeCard'
import RecentGames from '@/app/(protected)/(game)/components/RecentGames'
import { GAME_MODES } from '@/app/(protected)/(game)/models/GameMode'
import InstallAppBanner from '@/app/(pwa)/components/InstallAppBanner'

/** Main menu: greeting, install banner, the playable modes and the latest games. */
export default function HomeMenu({ playerName }: { playerName: string }) {
  return (
    <div className="home-menu">
      <InstallAppBanner />
      <section className="hero">
        <p className="greeting">¡Hola, {playerName}!</p>
        <h1 className="title">Elegí tu aventura</h1>
      </section>
      <div className="layout">
        <section className="modes">
          {Object.values(GAME_MODES).map((mode) => (
            <GameModeCard key={mode.mode} mode={mode} />
          ))}
        </section>
        <aside className="side">
          <RecentGames />
        </aside>
      </div>
    </div>
  )
}
