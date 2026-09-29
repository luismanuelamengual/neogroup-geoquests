import './index.scss'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import JoinGameDialog from '@/app/(protected)/(game)/components/JoinGameDialog'
import QuestCard from '@/app/(protected)/(game)/components/QuestCard'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'

/**
 * Second step of the main menu (/play/[mode]): after choosing the game mode,
 * the player chooses where to play — the quests offering that mode, as a grid
 * that grows with them. Multiplayer modes also offer joining a friend's game
 * by its code.
 */
export default function QuestPicker({ mode, quests }: { mode: GameModeView; quests: QuestView[] }) {
  return (
    <div className={`quest-picker mode-${mode.mode}`}>
      <Link href="/home" className="back">
        <ArrowBackIcon fontSize="small" /> Menú
      </Link>
      <header className="header">
        <GameModeIcon mode={mode.mode} className="icon" />
        <div className="heading">
          <h1 className="title">{mode.name}</h1>
          <p className="subtitle">Elegí dónde jugar</p>
        </div>
        {mode.maxPlayers > 1 && <JoinGameDialog className="join" />}
      </header>
      <section className="quests">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} mode={mode.mode} />
        ))}
      </section>
      {quests.length === 0 && <p className="empty">Todavía no hay mapas para este modo de juego.</p>}
    </div>
  )
}
