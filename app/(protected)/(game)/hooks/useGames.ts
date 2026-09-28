'use client'

import { useCallback } from 'react'
import { GameListItem, GameSession, GamesPage } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { useRequests } from '@/app/hooks/useRequests'

/** API calls of the game module. */
export function useGames() {
  const executeRequest = useRequests()
  const startGame = useCallback(
    (questId: number): Promise<GameSession> => executeRequest<GameSession>('/startGame', { questId }),
    [executeRequest]
  )
  const getGame = useCallback(
    (token: string): Promise<GameSession> => executeRequest<GameSession>('/getGame', { token }, false),
    [executeRequest]
  )
  const startRound = useCallback(
    (token: string): Promise<GameSession> => executeRequest<GameSession>('/startRound', { token }, false),
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
  const getGames = useCallback(
    (offset = 0, limit = 20): Promise<GamesPage> => executeRequest<GamesPage>('/getGames', { offset, limit }),
    [executeRequest]
  )

  return { startGame, getGame, startRound, submitGuess, getGameResult, getGames }
}
