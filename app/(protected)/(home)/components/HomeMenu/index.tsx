'use client'

import './index.scss'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import ActiveGameBanner from '@/app/(protected)/(game)/components/ActiveGameBanner'
import DailyChallengeCard from '@/app/(protected)/(game)/components/DailyChallengeCard'
import GameModeCard from '@/app/(protected)/(game)/components/GameModeCard'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import InstallAppBanner from '@/app/(pwa)/components/InstallAppBanner'
import { useT } from '@/app/i18n/I18nProvider'

interface HomeMenuProps {
  playerName: string
  /** Single player modes. */
  modes: GameModeView[]
}

/**
 * "Jugar" menu (/play): the single player game modes (the classic game with
 * the rules of the player's choice, the detective mode...). The multiplayer
 * games have their own menu (/multiplayer).
 * Above it, only when they apply, the install banner and the way back to a
 * multiplayer game in progress, and first of all today's challenge.
 */
export default function HomeMenu({ playerName, modes }: HomeMenuProps) {
  const t = useT()

  return (
    <div className="home-menu">
      <InstallAppBanner />
      <ActiveGameBanner />
      <section className="hero">
        <p className="greeting">{t('home.greeting', { name: playerName })}</p>
        <h1 className="title">{t('home.title')}</h1>
        <p className="subtitle">{t('home.subtitle')}</p>
      </section>
      <DailyChallengeCard />
      {modes.length > 0 && (
        <section className="menu-section">
          <h2 className="section-title">{t('home.modesTitle')}</h2>
          <div className="modes">
            {modes.map((mode) =>
              mode.mode === GameMode.CLASSIC ? (
                <GameModeCard
                  key={mode.mode}
                  mode={mode}
                  name={t('home.customClassic.name')}
                  description={t('home.customClassic.description')}
                />
              ) : (
                <GameModeCard key={mode.mode} mode={mode} />
              )
            )}
          </div>
        </section>
      )}
      {modes.length === 0 && <p className="no-modes">{t('home.noModes')}</p>}
      <AdSlot />
    </div>
  )
}
