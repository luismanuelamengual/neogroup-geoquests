'use client'

import { useCallback } from 'react'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { GamesPage } from '@/app/(protected)/(game)/models/GamesPage'
import { GameSyncResponse } from '@/app/(protected)/(game)/models/GameSyncResponse'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { useRequests } from '@/app/hooks/useRequests'

/** API calls of the game module. */
export function useGames() {
  const executeRequest = useRequests()
  const createGame = useCallback(
    (mapId: number | null, mode: GameMode, settings?: GameSettingsInput): Promise<GameView> =>
      executeRequest<GameView>('/createGame', { mapId, mode, settings }),
    [executeRequest]
  )
  const getGame = useCallback(
    (gameId: number, sinceVersion: number | null = null): Promise<GameSyncResponse> =>
      executeRequest<GameSyncResponse>('/getGame', { gameId, sinceVersion }, false),
    [executeRequest]
  )
  const sendGameAction = useCallback(
    (gameId: number, action: GameAction, notifyError = true): Promise<GameView> =>
      executeRequest<GameView>('/sendGameAction', { gameId, action }, notifyError),
    [executeRequest]
  )
  const joinGame = useCallback(
    (code: string): Promise<GameView> => executeRequest<GameView>('/joinGame', { code }),
    [executeRequest]
  )
  const leaveGame = useCallback(
    (gameId: number): Promise<void> => executeRequest<void>('/leaveGame', { gameId }),
    [executeRequest]
  )
  const kickPlayer = useCallback(
    (gameId: number, userId: number): Promise<GameView> => executeRequest<GameView>('/kickPlayer', { gameId, userId }),
    [executeRequest]
  )
  const startGame = useCallback(
    (gameId: number): Promise<GameView> => executeRequest<GameView>('/startGame', { gameId }),
    [executeRequest]
  )
  const getActiveGame = useCallback(
    (): Promise<GameView | null> => executeRequest<GameView | null>('/getActiveGame', {}, false),
    [executeRequest]
  )
  const getGames = useCallback(
    (offset = 0, limit = 20): Promise<GamesPage> => executeRequest<GamesPage>('/getGames', { offset, limit }),
    [executeRequest]
  )

  return {
    createGame,
    getGame,
    sendGameAction,
    joinGame,
    leaveGame,
    kickPlayer,
    startGame,
    getActiveGame,
    getGames
  }
}
