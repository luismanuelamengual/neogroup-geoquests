import './index.scss'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import JoinGameDialog from '@/app/(protected)/(game)/components/JoinGameDialog'
import MapCard from '@/app/(protected)/(game)/components/MapCard'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { MapView } from '@/app/(protected)/(game)/models/MapView'

/**
 * Second step of the main menu (/play/[mode]): after choosing the game mode,
 * the player chooses where to play — the maps, as a grid that grows with
 * them. Multiplayer modes also offer joining a friend's game by its code.
 */
export default function MapPicker({ mode, maps }: { mode: GameModeView; maps: MapView[] }) {
  return (
    <div className={`map-picker mode-${mode.mode}`}>
      <Link href="/play" className="back">
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
      <section className="maps">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} mode={mode} />
        ))}
      </section>
      {maps.length === 0 && <p className="empty">Todavía no hay mapas para jugar.</p>}
    </div>
  )
}
