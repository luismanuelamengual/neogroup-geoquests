import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'

/** Players of a mode, as a short text: "1 jugador", "2 a 8 jugadores". */
function formatPlayers({ minPlayers, maxPlayers }: GameModeView): string {
  if (maxPlayers === 1) {
    return '1 jugador'
  }

  return minPlayers === maxPlayers ? `${maxPlayers} jugadores` : `${minPlayers} a ${maxPlayers} jugadores`
}

/** Rounds of a mode, as a short text: "5 rondas", or "Eliminación" when the game lasts until a single player is left. */
function formatRounds({ settings }: GameModeView): string {
  return 'rounds' in settings ? `${settings.rounds} rondas` : 'Eliminación'
}

/**
 * Main menu card of a game mode — the first choice of the player: its image,
 * description and rules (players, rounds, time limit). It opens the maps
 * where the mode can be played (/play/[slug]).
 */
export default function GameModeCard({ mode }: { mode: GameModeView }) {
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
          <span className="tag">{formatPlayers(mode)}</span>
          <span className="tag">{formatRounds(mode)}</span>
          <span className="tag">
            {mode.settings.timeLimitSeconds
              ? `${formatTimeLimit(mode.settings.timeLimitSeconds)} por ronda`
              : 'Sin tiempo'}
          </span>
        </span>
        <span className="cta">
          Elegir <ArrowForwardIcon fontSize="small" />
        </span>
      </span>
    </Link>
  )
}
