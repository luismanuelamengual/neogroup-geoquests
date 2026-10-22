'use client'

import { useCallback } from 'react'
import { DailyChallengeView } from '@/app/(protected)/(game)/models/DailyChallengeView'
import { DailyLeaderboardInput } from '@/app/(protected)/(game)/models/DailyLeaderboardInput'
import { DailyLeaderboardView } from '@/app/(protected)/(game)/models/DailyLeaderboardView'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { GameSyncResponse } from '@/app/(protected)/(game)/models/GameSyncResponse'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { PublicGameItem } from '@/app/(protected)/(game)/models/PublicGameItem'
import { useRequests } from '@/app/hooks/useRequests'

/** API calls of the game module. */
export function useGames() {
  const executeRequest = useRequests()
  const createGame = useCallback(
    (mapId: number | null, mode: GameMode, settings?: GameSettingsInput, isPublic = false): Promise<GameView> =>
      executeRequest<GameView>('/createGame', { mapId, mode, settings, isPublic }),
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
  const joinPublicGame = useCallback(
    (gameId: number): Promise<GameView> => executeRequest<GameView>('/joinGame', { gameId }),
    [executeRequest]
  )
  const getPublicGames = useCallback(
    (): Promise<PublicGameItem[]> => executeRequest<PublicGameItem[]>('/getPublicGames', {}, false),
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
  const getDailyChallenge = useCallback(
    (): Promise<DailyChallengeView> => executeRequest<DailyChallengeView>('/getDailyChallenge', {}, false),
    [executeRequest]
  )
  const playDailyChallenge = useCallback(
    (): Promise<GameView> => executeRequest<GameView>('/playDailyChallenge', {}),
    [executeRequest]
  )
  const getDailyLeaderboard = useCallback(
    (input: DailyLeaderboardInput = {}): Promise<DailyLeaderboardView> =>
      executeRequest<DailyLeaderboardView>('/getDailyLeaderboard', input, false),
    [executeRequest]
  )
  const getPlayerStats = useCallback(
    (): Promise<PlayerStats> => executeRequest<PlayerStats>('/getPlayerStats', {}, false),
    [executeRequest]
  )

  return {
    createGame,
    getGame,
    sendGameAction,
    joinGame,
    joinPublicGame,
    getPublicGames,
    leaveGame,
    kickPlayer,
    startGame,
    getActiveGame,
    getDailyChallenge,
    playDailyChallenge,
    getDailyLeaderboard,
    getPlayerStats
  }
}
