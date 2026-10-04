'use client'

import './index.scss'
import { ComponentType, useCallback, useEffect, useState } from 'react'
import BattleRoyaleGamePlay from '@/app/(protected)/(game)/components/BattleRoyaleGamePlay'
import BattleRoyaleGameSummary from '@/app/(protected)/(game)/components/BattleRoyaleGameSummary'
import ClassicGamePlay from '@/app/(protected)/(game)/components/ClassicGamePlay'
import ClassicGameSummary from '@/app/(protected)/(game)/components/ClassicGameSummary'
import DetectiveGamePlay from '@/app/(protected)/(game)/components/DetectiveGamePlay'
import DetectiveGameSummary from '@/app/(protected)/(game)/components/DetectiveGameSummary'
import MultiplayerGamePlay from '@/app/(protected)/(game)/components/MultiplayerGamePlay'
import MultiplayerGameSummary from '@/app/(protected)/(game)/components/MultiplayerGameSummary'
import MultiplayerLobby from '@/app/(protected)/(game)/components/MultiplayerLobby'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useGameSync } from '@/app/(protected)/(game)/hooks/useGameSync'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'
import type { ApiError } from '@/app/models/ApiError'

interface ModeScreens {
  /** Waiting room (multiplayer modes). */
  Lobby?: ComponentType
  /** Screen of a game being played (it reads the game from the game store). */
  Play: ComponentType
  /** Screen of a finished game. */
  Summary: ComponentType
  /** Keep the game in sync with the server while it is not over (polling). */
  realtime?: boolean
}

/** Screens of each game mode: to add a mode, register its components here. */
const MODE_SCREENS: Partial<Record<GameMode, ModeScreens>> = {
  [GameMode.CLASSIC]: { Play: ClassicGamePlay, Summary: ClassicGameSummary },
  [GameMode.CLASSIC_MULTIPLAYER]: {
    Lobby: MultiplayerLobby,
    Play: MultiplayerGamePlay,
    Summary: MultiplayerGameSummary,
    realtime: true
  },
  [GameMode.BATTLE_ROYALE]: {
    Lobby: MultiplayerLobby,
    Play: BattleRoyaleGamePlay,
    Summary: BattleRoyaleGameSummary,
    realtime: true
  },
  [GameMode.DETECTIVE]: { Play: DetectiveGamePlay, Summary: DetectiveGameSummary }
}

/**
 * Screen of a game of any mode (/game/[id]): loads it from the server into the
 * game store and shows the screens of its mode — its waiting room, playing
 * it, or its summary once it is over (after the result of the last round was
 * closed). Real time modes are kept in sync by polling.
 */
export default function GameScreen({ gameId }: { gameId: number }) {
  const t = useT()
  const { getGame } = useGames()
  const game = useGameStore((state) => state.game)
  const phase = useGameStore((state) => state.phase)
  const setGame = useGameStore((state) => state.setGame)
  const reset = useGameStore((state) => state.reset)
  const [loadError, setLoadError] = useState<string | null>(null)
  const screens = game ? MODE_SCREENS[game.mode] : undefined
  const handleSyncError = useCallback(
    (error: Error) => {
      // Removed from the game (e.g. by the host) or the game was deleted.
      if ((error as ApiError).key === 'errors.gameNotFound') {
        setLoadError(t('game.removedFromGame'))
      }
    },
    [t]
  )

  useGameSync(
    gameId,
    !loadError && game?.id === gameId && !!screens?.realtime && game.status !== GameStatus.FINISHED,
    handleSyncError
  )

  useEffect(() => {
    reset()
    setLoadError(null)

    getGame(gameId)
      .then((response) => {
        if (!response.unchanged) {
          setGame(response.game)
        }
      })
      .catch((error: Error) => setLoadError(error.message || t('game.loadFailed')))

    return () => reset()
  }, [gameId, getGame, setGame, reset, t])

  if (loadError || (game && !screens)) {
    return (
      <div className="game-screen-error">
        <GamePanel className="panel">
          <p>{loadError ?? t('game.modeUnavailable')}</p>
          <GameButton href="/play">{t('game.backToMenu')}</GameButton>
        </GamePanel>
      </div>
    )
  }

  if (!game || !screens || game.id !== gameId) {
    return <Loading message={t('game.preparing')} />
  }

  const { Lobby, Play, Summary } = screens

  if (game.status === GameStatus.LOBBY && Lobby) {
    return <Lobby />
  }

  return game.status === GameStatus.FINISHED && phase !== 'result' ? <Summary /> : <Play />
}
