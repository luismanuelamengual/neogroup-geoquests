'use client'

import './index.scss'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle'
import { useCallback, useState } from 'react'
import DetectiveBriefing from '@/app/(protected)/(game)/components/DetectiveBriefing'
import DetectiveHud from '@/app/(protected)/(game)/components/DetectiveHud'
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
 * game store), and then the next stage — or the summary, once the case is closed.
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

  if (phase === 'result' && resultStage != null) {
    return <DetectiveTravelResult gameId={game.id} view={view} stageNumber={resultStage} onContinue={closeResult} />
  }

  if (fresh && !accepted) {
    return <DetectiveBriefing gameId={game.id} view={view} onAccept={() => setAccepted(true)} />
  }

  if (!stage) {
    return null
  }

  return (
    <div className="detective-game-play">
      <StreetView panoId={stage.panoId} />
      <DetectiveHud view={view} />
      <div className="detective-eyes">
        <PersonPinCircleIcon /> {t('detective.play.detectiveEyes')}
      </div>
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
