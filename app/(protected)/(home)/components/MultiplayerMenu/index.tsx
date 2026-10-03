'use client'

import './index.scss'
import GroupsIcon from '@mui/icons-material/Groups'
import ActiveGameBanner from '@/app/(protected)/(game)/components/ActiveGameBanner'
import GameModeCard from '@/app/(protected)/(game)/components/GameModeCard'
import JoinGameDialog from '@/app/(protected)/(game)/components/JoinGameDialog'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * "Multijugador" menu (/multiplayer): joining a friend's game by its code —
 * one button for every mode — and the multiplayer modes, each of which opens
 * the page where the host chooses the rules and the map of a new room. Above
 * it, when there is one, the way back to a multiplayer game in progress.
 */
export default function MultiplayerMenu({ modes }: { modes: GameModeView[] }) {
  const t = useT()

  return (
    <div className="multiplayer-menu">
      <ActiveGameBanner />
      <section className="hero">
        <p className="greeting">{t('multiplayerMenu.greeting')}</p>
        <h1 className="title">{t('multiplayerMenu.title')}</h1>
        <p className="subtitle">{t('multiplayerMenu.subtitle')}</p>
      </section>
      <section className="join-panel">
        <GroupsIcon className="join-icon" />
        <div className="join-text">
          <h2 className="join-title">{t('multiplayerMenu.joinTitle')}</h2>
          <p className="join-hint">{t('multiplayerMenu.joinText')}</p>
        </div>
        <JoinGameDialog size="large" className="join-button" />
      </section>
      <h2 className="section-title">{t('multiplayerMenu.createTitle')}</h2>
      <section className="modes">
        {modes.map((mode) => (
          <GameModeCard key={mode.mode} mode={mode} />
        ))}
      </section>
      {modes.length === 0 && <p className="no-modes">{t('home.noModes')}</p>}
    </div>
  )
}
