'use client'

import './index.scss'
import QuestCard from '@/app/(protected)/(game)/components/QuestCard'
import RecentGames from '@/app/(protected)/(game)/components/RecentGames'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'
import InstallAppBanner from '@/app/(pwa)/components/InstallAppBanner'

/** Main menu: greeting, install banner, every quest (game mode) and the latest games. */
export default function HomeMenu({ playerName, quests }: { playerName: string; quests: QuestView[] }) {
  return (
    <div className="home-menu">
      <InstallAppBanner />
      <section className="hero">
        <p className="greeting">¡Hola, {playerName}!</p>
        <h1 className="title">Elegí tu aventura</h1>
      </section>
      <div className="layout">
        <section className="modes">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
          {quests.length === 0 && <p className="no-quests">Todavía no hay modos de juego disponibles.</p>}
        </section>
        <aside className="side">
          <RecentGames />
        </aside>
      </div>
    </div>
  )
}
