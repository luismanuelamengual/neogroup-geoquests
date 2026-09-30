'use client'

import './index.scss'
import ActiveGameBanner from '@/app/(protected)/(game)/components/ActiveGameBanner'
import GameModeCard from '@/app/(protected)/(game)/components/GameModeCard'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import InstallAppBanner from '@/app/(pwa)/components/InstallAppBanner'

/**
 * Main menu: the choice of the game mode (each card opens the maps where
 * that mode can be played). Above it, only when they apply, the install
 * banner and the way back to a multiplayer game in progress.
 */
export default function HomeMenu({ playerName, modes }: { playerName: string; modes: GameModeView[] }) {
  return (
    <div className="home-menu">
      <InstallAppBanner />
      <ActiveGameBanner />
      <section className="hero">
        <p className="greeting">¡Hola, {playerName}!</p>
        <h1 className="title">¿Cómo querés jugar?</h1>
      </section>
      <section className="modes">
        {modes.map((mode) => (
          <GameModeCard key={mode.mode} mode={mode} />
        ))}
        {modes.length === 0 && <p className="no-modes">Todavía no hay modos de juego disponibles.</p>}
      </section>
    </div>
  )
}
