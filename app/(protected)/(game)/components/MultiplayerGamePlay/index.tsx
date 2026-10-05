'use client'

import './index.scss'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GuessPanel from '@/app/(protected)/(game)/components/GuessPanel'
import MultiplayerRoundResult from '@/app/(protected)/(game)/components/MultiplayerRoundResult'
import PlayersStatus from '@/app/(protected)/(game)/components/PlayersStatus'
import RoundCountdown from '@/app/(protected)/(game)/components/RoundCountdown'
import RoundHud from '@/app/(protected)/(game)/components/RoundHud'
import RoundTimer from '@/app/(protected)/(game)/components/RoundTimer'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'
import { useRoundCountdown } from '@/app/(protected)/(game)/hooks/useRoundCountdown'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { MULTIPLAYER_MENU_PATH } from '@/app/(protected)/(game)/utils/modeRoutes'
import { getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { useUserStore } from '@/app/(protected)/stores/users'
import GamePanel from '@/app/components/GamePanel'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Play screen of a classic multiplayer game (immersive). Everybody sees the
 * same round with the same clock: a countdown, then the street view and the
 * guess map; after guessing, who is still missing; when the round closes
 * (for everybody at once), the result with every pin. The game is kept up to
 * date by polling (useGameSync, in GameScreen); times are relative to when
 * the game was received.
 */
export default function MultiplayerGamePlay() {
  const t = useT()
  const router = useRouter()
  const { sendGameAction, leaveGame } = useGames()
  const game = useGameStore((state) => state.game)!
  const receivedAt = useGameStore((state) => state.receivedAt)
  const setGame = useGameStore((state) => state.setGame)
  const setGuess = useGameStore((state) => state.setGuess)
  const userId = useUserStore((state) => state.user?.id ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const submittingRef = useRef(false)
  const now = useNow(250)
  const view = game.modeView as ClassicMultiplayerGameView
  const roundNumber = view.currentRoundNumber ?? 1
  const round = view.rounds[roundNumber - 1]
  const colors = useMemo(() => getPlayerColors(game.players), [game.players])
  const startsAt = receivedAt + view.countdownMs
  const guessing = view.phase === 'guessing'
  const countingDown = useRoundCountdown(guessing, roundNumber, view.countdownMs, startsAt, now)
  const deadline = guessing && view.roundTimeLeftMs != null ? startsAt + view.roundTimeLeftMs : null
  const myScore = view.standings.find((standing) => standing.userId === userId)?.score ?? 0
  const isHost = userId != null && userId === game.hostUserId

  // A new round starts without a pin.
  useEffect(() => {
    setGuess(null)
  }, [roundNumber, setGuess])

  /** Sends the pin of the round (or none, when the countdown ended without one). */
  const submit = useCallback(
    async (automatic: boolean) => {
      const state = useGameStore.getState()
      const current = state.game?.modeView as ClassicMultiplayerGameView | undefined

      if (submittingRef.current || !state.game || !current?.currentRoundNumber || current.hasGuessed) {
        return
      }

      submittingRef.current = true
      setSubmitting(true)

      try {
        const updated = await sendGameAction(
          state.game.id,
          {
            type: 'guess',
            roundNumber: current.currentRoundNumber,
            latitude: state.guess?.latitude ?? null,
            longitude: state.guess?.longitude ?? null
          },
          // The round may have been closed by the server at the same moment: no error for automatic sends.
          !automatic
        )

        setGame(updated)
      } catch {
        // The error toast (if any) is shown by useRequests; polling brings the round's state.
      } finally {
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [sendGameAction, setGame]
  )

  const handleNext = async () => {
    setAdvancing(true)

    try {
      setGame(await sendGameAction(game.id, { type: 'next' }, false))
    } catch {
      // Someone (or the clock) already moved to the next round: polling brings it.
    } finally {
      setAdvancing(false)
    }
  }

  const handleExit = async () => {
    try {
      await leaveGame(game.id)
    } finally {
      router.push(MULTIPLAYER_MENU_PATH)
    }
  }

  if (!round) {
    return null
  }

  return (
    <div className="multiplayer-game-play">
      <StreetView panoId={round.panoId} />
      <RoundHud
        mapName={game.mapName}
        roundNumber={roundNumber}
        roundsCount={view.roundsCount}
        totalScore={myScore}
        exitMessage={t('game.exitMultiplayer')}
        onExit={handleExit}
        timer={
          guessing &&
          !countingDown &&
          deadline != null && <RoundTimer deadline={deadline} onExpire={() => submit(true)} />
        }
      />
      {guessing && (
        <PlayersStatus
          players={game.players}
          guessedUserIds={view.guessedUserIds}
          colors={colors}
          className="players"
        />
      )}
      {guessing && !view.hasGuessed && (
        <GuessPanel onSubmit={() => submit(false)} submitting={submitting} hidden={countingDown} />
      )}
      {guessing && view.hasGuessed && (
        <GamePanel className="waiting" accent="lime">
          <CheckCircleIcon className="icon" />
          <span>{t('game.ready')}</span>
        </GamePanel>
      )}
      {countingDown && <RoundCountdown startsAt={startsAt} roundNumber={roundNumber} roundsCount={view.roundsCount} />}
      {view.phase === 'reveal' && round.closed && (
        <MultiplayerRoundResult
          key={round.roundNumber}
          game={game}
          round={round}
          colors={colors}
          userId={userId}
          nextAt={view.revealTimeLeftMs != null ? receivedAt + view.revealTimeLeftMs : null}
          isHost={isHost}
          advancing={advancing}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
