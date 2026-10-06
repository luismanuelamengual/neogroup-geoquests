'use client'

import './index.scss'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import { ReactNode, useCallback, useState } from 'react'
import BackgroundMusic from '@/app/(protected)/(game)/components/BackgroundMusic'
import DetectiveBriefing from '@/app/(protected)/(game)/components/DetectiveBriefing'
import DetectiveHud from '@/app/(protected)/(game)/components/DetectiveHud'
import DetectiveLineup from '@/app/(protected)/(game)/components/DetectiveLineup'
import DetectiveTravelPanel from '@/app/(protected)/(game)/components/DetectiveTravelPanel'
import DetectiveTravelResult from '@/app/(protected)/(game)/components/DetectiveTravelResult'
import DetectiveWitnesses from '@/app/(protected)/(game)/components/DetectiveWitnesses'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Play screen of a detective game. A new case opens with its briefing. Then,
 * at every stage: where the detective is (Street View of the current stop), the
 * HUD with the fictional clock, the witnesses (tap to hear their clues) and
 * the button to travel. After a trip, the trip itself (phase "result" of the
 * game store), and then the next stage. After the last trip, in time, the
 * suspects (the detective points at the thief) and who the thief was (phase
 * "result" again); then the summary, once the case is closed.
 */
export default function DetectiveGamePlay() {
  const t = useT()
  const { sendGameAction } = useGames()
  const game = useGameStore((state) => state.game)!
  const phase = useGameStore((state) => state.phase)
  const resultStage = useGameStore((state) => state.resultRoundNumber)
  const setGame = useGameStore((state) => state.setGame)
  const showResult = useGameStore((state) => state.showResult)
  const closeResult = useGameStore((state) => state.closeResult)
  const view = game.modeView as DetectiveGameView
  const [accepted, setAccepted] = useState(false)
  const [traveling, setTraveling] = useState(false)
  const stage = view.currentStage
  const fresh =
    view.currentStageNumber === 1 && view.elapsedMinutes === 0 && !!stage?.witnesses.every((witness) => !witness.asked)
  const handleAsk = useCallback(
    async (witness: number) => {
      if (!stage) {
        return
      }

      setGame(await sendGameAction(game.id, { type: 'askWitness', stageNumber: stage.stageNumber, witness }))
    },
    [game.id, stage, sendGameAction, setGame]
  )
  const handleAccuse = useCallback(
    async (suspect: number) => {
      const updated = await sendGameAction(game.id, { type: 'accuse', suspect })

      // The reveal of the thief is shown like the result of one more stage.
      showResult(updated, view.stagesCount + 1)
    },
    [game.id, view.stagesCount, sendGameAction, showResult]
  )
  const handleTravel = useCallback(
    async (placeId: number) => {
      if (!stage) {
        return
      }

      const updated = await sendGameAction(game.id, { type: 'travel', stageNumber: stage.stageNumber, placeId })

      setTraveling(false)
      showResult(updated, stage.stageNumber)
    },
    [game.id, stage, sendGameAction, showResult]
  )
  let screen: ReactNode

  if (phase === 'result' && resultStage != null && resultStage > view.stagesCount && view.lineup) {
    screen = <DetectiveLineup view={view} onAccuse={handleAccuse} revealed onContinue={closeResult} />
  } else if (phase === 'result' && resultStage != null) {
    screen = <DetectiveTravelResult gameId={game.id} view={view} stageNumber={resultStage} onContinue={closeResult} />
  } else if (fresh && !accepted) {
    screen = <DetectiveBriefing gameId={game.id} view={view} onAccept={() => setAccepted(true)} />
  } else if (view.lineup && view.outcome === null) {
    screen = <DetectiveLineup view={view} onAccuse={handleAccuse} />
  } else if (!stage) {
    screen = null
  } else {
    screen = (
      <div className="detective-game-play">
        <StreetView panoId={stage.panoId} />
        <DetectiveHud view={view} />
        <div className="bottom">
          {/* Remounted at every stage: new witnesses, no bubble open. */}
          <DetectiveWitnesses
            key={stage.stageNumber}
            witnesses={stage.witnesses}
            witnessMinutes={view.witnessMinutes}
            onAsk={handleAsk}
            noTime={view.timeLimitMinutes - view.elapsedMinutes < view.witnessMinutes}
          />
          <GameButton
            size="large"
            className="travel"
            startIcon={<FlightTakeoffIcon />}
            onClick={() => setTraveling(true)}
          >
            {t('detective.play.travel')}
          </GameButton>
        </div>
        <DetectiveTravelPanel
          key={`panel-${stage.stageNumber}`}
          open={traveling}
          stage={stage}
          onClose={() => setTraveling(false)}
          lastChance={view.mistakes >= view.maxMistakes}
          onTravel={handleTravel}
        />
      </div>
    )
  }

  // The music is outside the screens (briefing, play, trip) so it goes on between them,
  // until the case is over (the summary is another component).
  return (
    <>
      <BackgroundMusic />
      {screen}
    </>
  )
}
