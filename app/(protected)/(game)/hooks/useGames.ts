'use client'

import { useCallback } from 'react'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameListItem, GameView } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { useRequests } from '@/app/hooks/useRequests'

/** API calls of the game module. */
export function useGames() {
  const executeRequest = useRequests()
  const startGame = useCallback(
    (mode: GameMode): Promise<GameView> => executeRequest<GameView>('/startGame', { mode }),
    [executeRequest]
  )
  const getGame = useCallback(
    (gameId: number): Promise<GameView> => executeRequest<GameView>('/getGame', { gameId }),
    [executeRequest]
  )
  const submitGuess = useCallback(
    (input: GuessInput): Promise<GameView> => executeRequest<GameView>('/submitGuess', input),
    [executeRequest]
  )
  const getRecentGames = useCallback(
    (): Promise<GameListItem[]> => executeRequest<GameListItem[]>('/getRecentGames'),
    [executeRequest]
  )

  return { startGame, getGame, submitGuess, getRecentGames }
}
