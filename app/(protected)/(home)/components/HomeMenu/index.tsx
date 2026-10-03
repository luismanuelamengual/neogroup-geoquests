'use client'

import './index.scss'
import ActiveGameBanner from '@/app/(protected)/(game)/components/ActiveGameBanner'
import GameModeCard from '@/app/(protected)/(game)/components/GameModeCard'
import QuickPlayCard from '@/app/(protected)/(game)/components/QuickPlayCard'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { QuickPlayView } from '@/app/(protected)/(game)/models/QuickPlayView'
import InstallAppBanner from '@/app/(pwa)/components/InstallAppBanner'
import { useT } from '@/app/i18n/I18nProvider'

interface HomeMenuProps {
  playerName: string
  /** Single player modes. */
  modes: GameModeView[]
  quickPlays: QuickPlayView[]
}

/**
 * "Jugar" menu (/play): the single player games — the quick games, which
 * start right away, and the classic game with the rules of the player's
 * choice. The multiplayer games have their own menu (/multiplayer). Above
 * it, only when they apply, the install banner and the way back to a
 * multiplayer game in progress.
 */
export default function HomeMenu({ playerName, modes, quickPlays }: HomeMenuProps) {
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
      <section className="modes">
        {quickPlays.map((quickPlay) => (
          <QuickPlayCard key={quickPlay.key} quickPlay={quickPlay} />
        ))}
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
      </section>
      {modes.length === 0 && quickPlays.length === 0 && <p className="no-modes">{t('home.noModes')}</p>}
    </div>
  )
}
