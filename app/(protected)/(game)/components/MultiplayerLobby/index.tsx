'use client'

import './index.scss'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import InviteButton from '@/app/(protected)/(game)/components/InviteButton'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { MultiplayerGameView } from '@/app/(protected)/(game)/models/MultiplayerGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import PlayerAvatar from '@/app/components/PlayerAvatar'

/**
 * Waiting room of a multiplayer game: the invitation code (and the button to
 * share it), the players who joined — kept up to date by polling — and, for
 * the host, the button that starts the game.
 */
export default function MultiplayerLobby() {
  const router = useRouter()
  const { startGame, leaveGame, kickPlayer } = useGames()
  const game = useGameStore((state) => state.game)!
  const setGame = useGameStore((state) => state.setGame)
  const userId = useUserStore((state) => state.user?.id)
  const [starting, setStarting] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const view = game.modeView as MultiplayerGameView & { roundsCount?: number }
  const players = game.players.filter((player) => player.status === GamePlayerStatus.ACTIVE)
  const colors = getPlayerColors(game.players)
  const isHost = userId != null && userId === game.hostUserId
  const host = players.find((player) => player.userId === game.hostUserId)
  const enoughPlayers = players.length >= view.minPlayers

  const handleStart = async () => {
    setStarting(true)

    try {
      setGame(await startGame(game.id))
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      setStarting(false)
    }
  }

  const handleLeave = async () => {
    setLeaving(true)

    try {
      await leaveGame(game.id)
      router.push('/play')
    } catch {
      setLeaving(false)
    }
  }

  const handleKick = async (playerId: number) => {
    try {
      setGame(await kickPlayer(game.id, playerId))
    } catch {
      // The error toast is shown by useRequests.
    }
  }

  return (
    <div className="multiplayer-lobby">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <GamePanel className="panel" title="Sala de espera" accent="cyan">
        <div className="map">{game.mapName}</div>
        <div className="rules">
          {view.roundsCount ? `${view.roundsCount} rondas` : 'Eliminación'} · {formatTimeLimit(view.timeLimitSeconds)}{' '}
          por ronda
        </div>
        {game.code && (
          <div className="code-box">
            <span className="caption">Código de la partida</span>
            <span className="code">{game.code}</span>
          </div>
        )}
        {game.code && <InviteButton code={game.code} />}
        <div className="players-header">
          <span>Jugadores</span>
          <span>
            {players.length}/{view.maxPlayers}
          </span>
        </div>
        <ul className="players">
          {players.map((player) => (
            <li key={player.userId} className="player">
              <PlayerAvatar name={player.name} color={colors.get(player.userId)} />
              <span className="name">
                {player.name}
                {player.userId === userId && <span className="you"> (vos)</span>}
              </span>
              {player.userId === game.hostUserId && <span className="host">Anfitrión</span>}
              {isHost && player.userId !== userId && (
                <IconButton
                  className="kick"
                  size="small"
                  onClick={() => handleKick(player.userId)}
                  aria-label={`Sacar a ${player.name}`}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
        {isHost ? (
          <GameButton
            size="large"
            fullWidth
            startIcon={<PlayArrowIcon />}
            disabled={!enoughPlayers}
            loading={starting}
            onClick={handleStart}
          >
            {enoughPlayers ? 'Empezar partida' : `Esperando jugadores (mínimo ${view.minPlayers})`}
          </GameButton>
        ) : (
          <p className="waiting">Esperando a que {host?.name ?? 'el anfitrión'} empiece la partida…</p>
        )}
        <GameButton color="ghost" fullWidth loading={leaving} onClick={handleLeave}>
          Salir de la sala
        </GameButton>
      </GamePanel>
    </div>
  )
}
