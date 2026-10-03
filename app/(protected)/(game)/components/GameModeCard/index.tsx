'use client'

import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import classNames from 'classnames'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { getModePath } from '@/app/(protected)/(game)/utils/modeRoutes'
import { useT } from '@/app/i18n/I18nProvider'
import type { Translator } from '@/app/i18n/translate'

/** Players of a mode, as a short text: "1 player", "2 to 8 players". */
function formatPlayers({ minPlayers, maxPlayers }: GameModeView, t: Translator): string {
  if (maxPlayers === 1) {
    return t('modes.onePlayer')
  }

  return minPlayers === maxPlayers
    ? t('modes.playersExact', { count: maxPlayers })
    : t('modes.playersRange', { min: minPlayers, max: maxPlayers })
}

interface GameModeCardProps {
  mode: GameModeView
  /** Name shown instead of the one of the mode. */
  name?: string
  /** Description shown instead of the one of the mode. */
  description?: string
}

/**
 * Main menu card of a game mode: its image, description and players. It
 * opens the page where the player chooses the rules and the map
 * (/play/[slug] or /multiplayer/[slug]). Gold for single player modes, cyan for multiplayer ones.
 */
export default function GameModeCard({ mode, name, description }: GameModeCardProps) {
  const t = useT()

  return (
    <Link href={getModePath(mode)} className={classNames('game-mode-card', { multi: mode.maxPlayers > 1 })}>
      <span className="art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mode.image} alt="" className="image" />
        <span className="badge">
          <GameModeIcon mode={mode.mode} className="icon" />
        </span>
      </span>
      <span className="content">
        <span className="name">{name ?? mode.name}</span>
        <span className="description">{description ?? mode.description}</span>
        <span className="tags">
          {/* Players only in multiplayer modes: single player ones are in the "Jugar" menu, where it goes without saying. */}
          {mode.maxPlayers > 1 && <span className="tag">{formatPlayers(mode, t)}</span>}
          {!('rounds' in mode.settings) && <span className="tag">{t('modes.elimination')}</span>}
          <span className="tag">{t('modes.configurable')}</span>
        </span>
        <span className="cta">
          {t('modes.choose')} <ArrowForwardIcon fontSize="small" />
        </span>
      </span>
    </Link>
  )
}
