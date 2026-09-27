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
import { loadGameSession, removeGameSession, saveGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

const NOT_ON_THIS_DEVICE =
  'Esta partida se empezó en otro dispositivo o navegador: solo se puede seguir jugando desde ahí.'

/**
 * Play screen of a game: full-screen street view, HUD, guess panel and the
 * result overlay after each guess. Covers the app shell (immersive mode).
 *
 * The game comes from this device's storage (its encrypted token): the server
 * does not keep the rounds, so a game can only be played where it started.
 */
export default function GamePlay({ gameId }: { gameId: number }) {
  const router = useRouter()
  const { getGame, submitGuess } = useGames()
  const { game, token, phase, guess, resultRoundNumber, setSession, showResult, nextRound, reset } = useGameStore()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = loadGameSession(gameId)

    reset()

    if (!stored) {
      setLoadError(NOT_ON_THIS_DEVICE)

      return
    }

    // Validate the stored token with the server (it rejects outdated tokens).
    getGame(stored.token)
      .then((session) => {
        saveGameSession(session)

        if (session.game.status === GameStatus.FINISHED) {
          router.replace(`/game/${gameId}/summary`)

          return
        }

        setSession(session)
      })
      .catch((error: Error) => {
        if (error.message.includes('desactualizada')) {
          removeGameSession(gameId)
        }

        setLoadError(error.message || 'No pudimos cargar la partida.')
      })

    return () => reset()
  }, [gameId, getGame, router, setSession, reset])

  if (loadError) {
    return (
      <div className="game-play">
        <div className="game-play-error">
          <p>{loadError}</p>
          <GameButton href="/home">Volver al menú</GameButton>
        </div>
      </div>
    )
  }

  if (!game || !token || game.id !== gameId) {
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
      const session = await submitGuess({ token, roundNumber, ...guess })

      saveGameSession(session)
      showResult(session, roundNumber)
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
