'use client'

import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
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

/** Rounds of a mode, as a short text: "5 rounds", or "Elimination" when the game lasts until a single player is left. */
function formatRounds({ settings }: GameModeView, t: Translator): string {
  return 'rounds' in settings ? t('modes.rounds', { count: settings.rounds }) : t('modes.elimination')
}

/**
 * Main menu card of a game mode — the first choice of the player: its image,
 * description and rules (players, rounds, time limit). It opens the maps
 * where the mode can be played (/play/[slug]).
 */
export default function GameModeCard({ mode }: { mode: GameModeView }) {
  const t = useT()

  return (
    <Link href={`/play/${mode.slug}`} className={`game-mode-card mode-${mode.mode}`}>
      <span className="art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mode.image} alt="" className="image" />
        <span className="badge">
          <GameModeIcon mode={mode.mode} className="icon" />
        </span>
      </span>
      <span className="content">
        <span className="name">{mode.name}</span>
        <span className="description">{mode.description}</span>
        <span className="tags">
          <span className="tag">{formatPlayers(mode, t)}</span>
          <span className="tag">{formatRounds(mode, t)}</span>
          <span className="tag">
            {mode.settings.timeLimitSeconds
              ? t('modes.timePerRound', { time: formatTimeLimit(mode.settings.timeLimitSeconds, t) })
              : t('modes.noTime')}
          </span>
        </span>
        <span className="cta">
          {t('modes.choose')} <ArrowForwardIcon fontSize="small" />
        </span>
      </span>
    </Link>
  )
}
