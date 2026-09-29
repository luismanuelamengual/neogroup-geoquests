import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'

/** Players of a mode, as a short text: "1 jugador", "2 a 8 jugadores". */
function formatPlayers({ minPlayers, maxPlayers }: GameModeView): string {
  if (maxPlayers === 1) {
    return '1 jugador'
  }

  return minPlayers === maxPlayers ? `${maxPlayers} jugadores` : `${minPlayers} a ${maxPlayers} jugadores`
}

/**
 * Main menu card of a game mode — the first choice of the player: its image,
 * description and players, like the quest cards. It opens the quests where
 * the mode can be played (/play/[slug]).
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
          <span className="tag">
            {mode.questsCount} {mode.questsCount === 1 ? 'mapa' : 'mapas'}
          </span>
        </span>
        <span className="cta">
          Elegir <ArrowForwardIcon fontSize="small" />
        </span>
      </span>
    </Link>
  )
}
