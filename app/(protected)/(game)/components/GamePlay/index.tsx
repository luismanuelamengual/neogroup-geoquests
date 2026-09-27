'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import GuessPanel from '@/app/(protected)/(game)/components/GuessPanel'
import RoundHud from '@/app/(protected)/(game)/components/RoundHud'
import RoundResult from '@/app/(protected)/(game)/components/RoundResult'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { getGameModeConfig } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

/**
 * Play screen of a game: full-screen street view, HUD, guess panel and the
 * result overlay after each guess. Covers the app shell (immersive mode).
 */
export default function GamePlay({ gameId }: { gameId: number }) {
  const router = useRouter()
  const { getGame, submitGuess } = useGames()
  const { game, phase, guess, resultRoundNumber, setGame, showResult, nextRound, reset } = useGameStore()
  const [loadError, setLoadError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    reset()
    getGame(gameId)
      .then((loadedGame) => {
        if (loadedGame.status === GameStatus.FINISHED) {
          router.replace(`/game/${gameId}/summary`)

          return
        }

        setGame(loadedGame)
      })
      .catch(() => setLoadError(true))

    return () => reset()
  }, [gameId, getGame, router, setGame, reset])

  if (loadError) {
    return (
      <div className="game-play">
        <div className="game-play-error">
          <p>No pudimos cargar la partida.</p>
          <GameButton href="/home">Volver al menú</GameButton>
        </div>
      </div>
    )
  }

  if (!game || game.id !== gameId) {
    return (
      <div className="game-play">
        <Loading message="Preparando la partida..." />
      </div>
    )
  }

  const displayedRoundNumber = phase === 'result' ? resultRoundNumber! : (game.currentRoundNumber ?? game.roundsCount)
  const round = game.rounds[displayedRoundNumber - 1]
  const maxRoundScore = getGameModeConfig(game.mode).score.maxScore

  const handleSubmit = async () => {
    if (!guess || !game.currentRoundNumber) {
      return
    }

    const roundNumber = game.currentRoundNumber

    setSubmitting(true)

    try {
      const updatedGame = await submitGuess({ gameId: game.id, roundNumber, ...guess })

      showResult(updatedGame, roundNumber)
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (game.status === GameStatus.FINISHED) {
      router.push(`/game/${game.id}/summary`)

      return
    }

    nextRound()
  }

  return (
    <div className="game-play">
      <StreetView imageId={round.imageId} />
      <RoundHud game={game} roundNumber={displayedRoundNumber} />
      {phase === 'guessing' && <GuessPanel onSubmit={handleSubmit} submitting={submitting} />}
      {phase === 'result' && round.guessed && (
        <RoundResult
          round={round}
          maxRoundScore={maxRoundScore}
          isLastRound={game.status === GameStatus.FINISHED}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
