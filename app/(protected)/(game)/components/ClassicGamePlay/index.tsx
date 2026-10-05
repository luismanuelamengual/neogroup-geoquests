'use client'

import './index.scss'
import { useCallback, useEffect, useRef, useState } from 'react'
import GuessPanel from '@/app/(protected)/(game)/components/GuessPanel'
import RoundHud from '@/app/(protected)/(game)/components/RoundHud'
import RoundResult from '@/app/(protected)/(game)/components/RoundResult'
import RoundTimer from '@/app/(protected)/(game)/components/RoundTimer'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'

function classicView(game: GameView): ClassicGameView {
  return game.modeView as ClassicGameView
}

/**
 * Play screen of a classic game: full-screen street view, HUD (with the
 * countdown of timed games), guess panel and the result overlay after each
 * guess. Covers the app shell (immersive mode).
 *
 * The game lives in the server, so it can be resumed from any device. Every
 * time a timed round is shown the server is told (startRound action), which
 * starts its clock; when the countdown ends the pin placed so far (if any) is
 * sent.
 */
export default function ClassicGamePlay() {
  const { sendGameAction } = useGames()
  const game = useGameStore((state) => state.game)!
  const phase = useGameStore((state) => state.phase)
  const resultRoundNumber = useGameStore((state) => state.resultRoundNumber)
  const deadline = useGameStore((state) => state.deadline)
  const setGame = useGameStore((state) => state.setGame)
  const showResult = useGameStore((state) => state.showResult)
  const closeResult = useGameStore((state) => state.closeResult)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const view = classicView(game)
  const { currentRoundNumber, timeLimitSeconds, roundTimeLeftMs } = view

  // Starts the clock of the round on screen (timed games) — idempotent on the server,
  // so a reload keeps the original start time. Also sets the countdown of a resumed round.
  useEffect(() => {
    if (phase !== 'guessing' || currentRoundNumber == null || timeLimitSeconds == null) {
      return
    }

    if (roundTimeLeftMs != null) {
      if (useGameStore.getState().deadline == null) {
        setGame(game, roundTimeLeftMs)
      }

      return
    }

    sendGameAction(game.id, { type: 'startRound' }, false)
      .then((started) => setGame(started, classicView(started).roundTimeLeftMs))
      .catch(() => {
        // Without a started round the guess is rejected with a message.
      })
  }, [game, phase, currentRoundNumber, timeLimitSeconds, roundTimeLeftMs, sendGameAction, setGame])

  /** Sends the pin of the current round (or none, when the time ran out without one). */
  const submit = useCallback(async () => {
    const state = useGameStore.getState()
    const roundNumber = state.game ? classicView(state.game).currentRoundNumber : null

    if (submittingRef.current || !state.game || !roundNumber || state.phase !== 'guessing') {
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const updated = await sendGameAction(state.game.id, {
        type: 'guess',
        roundNumber,
        latitude: state.guess?.latitude ?? null,
        longitude: state.guess?.longitude ?? null
      })

      showResult(updated, roundNumber)
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [sendGameAction, showResult])
  const displayedRoundNumber = phase === 'result' ? resultRoundNumber! : (currentRoundNumber ?? view.roundsCount)
  const round = view.rounds[displayedRoundNumber - 1]

  return (
    <div className="classic-game-play">
      <StreetView panoId={round.panoId} />
      <RoundHud
        mapSlug={game.mapSlug}
        roundNumber={displayedRoundNumber}
        roundsCount={view.roundsCount}
        totalScore={view.totalScore}
        timer={phase === 'guessing' && deadline != null && <RoundTimer deadline={deadline} onExpire={submit} />}
      />
      {phase === 'guessing' && <GuessPanel onSubmit={submit} submitting={submitting} />}
      {phase === 'result' && round.guessed && (
        <RoundResult
          round={round}
          maxRoundScore={MAX_ROUND_SCORE}
          isLastRound={game.status === GameStatus.FINISHED}
          onContinue={closeResult}
        />
      )}
    </div>
  )
}
