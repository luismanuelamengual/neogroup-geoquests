'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import GuessPanel from '@/app/(protected)/(game)/components/GuessPanel'
import RoundHud from '@/app/(protected)/(game)/components/RoundHud'
import RoundResult from '@/app/(protected)/(game)/components/RoundResult'
import RoundTimer from '@/app/(protected)/(game)/components/RoundTimer'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { loadGameSession, removeGameSession, saveGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'

const NOT_ON_THIS_DEVICE =
  'Esta partida se empezó en otro dispositivo o navegador: solo se puede seguir jugando desde ahí.'

/**
 * Play screen of a game: full-screen street view, HUD (with the countdown of
 * timed quests), guess panel and the result overlay after each guess. Covers
 * the app shell (immersive mode).
 *
 * The game comes from this device's storage (its encrypted token): the server
 * does not keep the rounds, so a game can only be played where it started.
 * Every time a round is shown the server is told (startRound), which starts
 * its clock; when the countdown ends the pin placed so far (if any) is sent.
 */
export default function GamePlay({ gameId }: { gameId: number }) {
  const router = useRouter()
  const { startRound, submitGuess } = useGames()
  const { game, token, phase, resultRoundNumber, deadline, setSession, showResult, nextRound, reset } = useGameStore()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    const stored = loadGameSession(gameId)

    reset()

    if (!stored) {
      setLoadError(NOT_ON_THIS_DEVICE)

      return
    }

    // Validates the stored token with the server (outdated tokens are rejected)
    // and starts the clock of the current round.
    startRound(stored.token)
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
  }, [gameId, startRound, router, setSession, reset])

  /** Sends the pin of the current round (or none, when the time ran out without one). */
  const submit = useCallback(async () => {
    const state = useGameStore.getState()
    const roundNumber = state.game?.currentRoundNumber

    if (submittingRef.current || !state.token || !roundNumber || state.phase !== 'guessing') {
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const session = await submitGuess({
        token: state.token,
        roundNumber,
        latitude: state.guess?.latitude ?? null,
        longitude: state.guess?.longitude ?? null
      })

      saveGameSession(session)
      showResult(session, roundNumber)
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [submitGuess, showResult])

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

  const handleContinue = async () => {
    if (game.status === GameStatus.FINISHED) {
      router.push(`/game/${game.id}/summary`)

      return
    }

    nextRound()

    try {
      const session = await startRound(token)

      saveGameSession(session)
      setSession(session)
    } catch {
      // Without a started round the next guess is rejected with a message.
    }
  }

  return (
    <div className="game-play">
      <StreetView imageId={round.imageId} />
      <RoundHud
        game={game}
        roundNumber={displayedRoundNumber}
        timer={phase === 'guessing' && deadline != null && <RoundTimer deadline={deadline} onExpire={submit} />}
      />
      {phase === 'guessing' && <GuessPanel onSubmit={submit} submitting={submitting} />}
      {phase === 'result' && round.guessed && (
        <RoundResult
          round={round}
          maxRoundScore={MAX_ROUND_SCORE}
          isLastRound={game.status === GameStatus.FINISHED}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
