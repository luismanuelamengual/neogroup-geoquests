'use client'

import { useCallback } from 'react'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameListItem, GameSession } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { useRequests } from '@/app/hooks/useRequests'

/** API calls of the game module. */
export function useGames() {
  const executeRequest = useRequests()
  const startGame = useCallback(
    (mode: GameMode): Promise<GameSession> => executeRequest<GameSession>('/startGame', { mode }),
    [executeRequest]
  )
  const getGame = useCallback(
    (token: string): Promise<GameSession> => executeRequest<GameSession>('/getGame', { token }, false),
    [executeRequest]
  )
  const submitGuess = useCallback(
    (input: GuessInput): Promise<GameSession> => executeRequest<GameSession>('/submitGuess', input),
    [executeRequest]
  )
  const getGameResult = useCallback(
    (gameId: number): Promise<GameListItem> => executeRequest<GameListItem>('/getGameResult', { gameId }, false),
    [executeRequest]
  )
  const getRecentGames = useCallback(
    (): Promise<GameListItem[]> => executeRequest<GameListItem[]>('/getRecentGames'),
    [executeRequest]
  )

  return { startGame, getGame, submitGuess, getGameResult, getRecentGames }
}
