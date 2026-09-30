'use client'

import './index.scss'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BattleRoyaleRoundResult from '@/app/(protected)/(game)/components/BattleRoyaleRoundResult'
import GuessPanel from '@/app/(protected)/(game)/components/GuessPanel'
import PlayersStatus from '@/app/(protected)/(game)/components/PlayersStatus'
import RoundCountdown from '@/app/(protected)/(game)/components/RoundCountdown'
import RoundHud from '@/app/(protected)/(game)/components/RoundHud'
import RoundTimer from '@/app/(protected)/(game)/components/RoundTimer'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'
import { BattleRoyaleGameView } from '@/app/(protected)/(game)/models/BattleRoyaleGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { useUserStore } from '@/app/(protected)/stores/users'
import GamePanel from '@/app/components/GamePanel'

/**
 * Play screen of a battle royale game (immersive). Like the classic
 * multiplayer screen — same round and clock for everybody, countdown,
 * who already guessed, result with every pin — but every round someone is
 * eliminated: the HUD shows how many are left, and an eliminated player keeps
 * watching the game without guessing.
 */
export default function BattleRoyaleGamePlay() {
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
  const view = game.modeView as BattleRoyaleGameView
  const roundNumber = view.currentRoundNumber ?? 1
  const round = view.rounds[roundNumber - 1]
  const colors = useMemo(() => getPlayerColors(game.players), [game.players])
  const alivePlayers = useMemo(
    () => game.players.filter((player) => view.aliveUserIds.includes(player.userId)),
    [game.players, view.aliveUserIds]
  )
  const startsAt = receivedAt + view.countdownMs
  const guessing = view.phase === 'guessing'
  const countingDown = guessing && now < startsAt
  const deadline = guessing && view.roundTimeLeftMs != null ? startsAt + view.roundTimeLeftMs : null
  const canGuess = guessing && !countingDown && !view.isEliminated && !view.hasGuessed
  const isHost = userId != null && userId === game.hostUserId

  // A new round starts without a pin.
  useEffect(() => {
    setGuess(null)
  }, [roundNumber, setGuess])

  /** Sends the pin of the round (or none, when the countdown ended without one). */
  const submit = useCallback(
    async (automatic: boolean) => {
      const state = useGameStore.getState()
      const current = state.game?.modeView as BattleRoyaleGameView | undefined

      if (
        submittingRef.current ||
        !state.game ||
        !current?.currentRoundNumber ||
        current.hasGuessed ||
        current.isEliminated
      ) {
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
      router.push('/play')
    }
  }

  if (!round) {
    return null
  }

  return (
    <div className="battle-royale-game-play">
      <StreetView panoId={round.panoId} />
      <RoundHud
        mapName={game.mapName}
        roundNumber={roundNumber}
        roundsCount={null}
        stat={{ caption: 'Quedan', value: view.aliveUserIds.length }}
        exitMessage={
          view.isEliminated
            ? 'Ya quedaste eliminado: si salís, dejás de mirar la partida.'
            : 'Si salís, abandonás la partida y quedás eliminado.'
        }
        onExit={handleExit}
        timer={
          guessing &&
          !countingDown &&
          !view.isEliminated &&
          deadline != null && <RoundTimer deadline={deadline} onExpire={() => submit(true)} />
        }
      />
      {guessing && (
        <PlayersStatus
          players={alivePlayers}
          guessedUserIds={view.guessedUserIds}
          colors={colors}
          className="players"
        />
      )}
      {canGuess && <GuessPanel onSubmit={() => submit(false)} submitting={submitting} />}
      {guessing && !view.isEliminated && view.hasGuessed && (
        <GamePanel className="waiting" accent="lime">
          <CheckCircleIcon className="icon" />
          <span>¡Listo! Esperando a los demás…</span>
        </GamePanel>
      )}
      {guessing && view.isEliminated && (
        <GamePanel className="eliminated" accent="magenta">
          <span className="title">Quedaste eliminado</span>
          <span className="text">Seguís mirando la partida hasta que quede uno solo.</span>
        </GamePanel>
      )}
      {countingDown && <RoundCountdown startsAt={startsAt} roundNumber={roundNumber} />}
      {view.phase === 'reveal' && round.closed && (
        <BattleRoyaleRoundResult
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
