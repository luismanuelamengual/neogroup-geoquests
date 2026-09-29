'use client'

import './index.scss'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import type { PaddingOptions } from 'maplibre-gl'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import Scoreboard, { ScoreboardEntry } from '@/app/(protected)/(game)/components/Scoreboard'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { MultiplayerRoundView } from '@/app/(protected)/(game)/models/MultiplayerRoundView'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { getPlayerInitial } from '@/app/(protected)/(game)/utils/players'
import { formatDistance } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'

interface MultiplayerRoundResultProps {
  game: GameView
  round: MultiplayerRoundView
  colors: Map<number, string>
  userId: number | null
  /** When the next round starts (epoch ms, this device's clock). */
  nextAt: number | null
  isHost: boolean
  advancing: boolean
  onNext: () => void
}

/**
 * Result of a multiplayer round, shown to everybody at the same time: the
 * answer and every player's pin on the map, the points of the round and the
 * positions so far, with the countdown to the next round (the host can skip it).
 */
export default function MultiplayerRoundResult({
  game,
  round,
  colors,
  userId,
  nextAt,
  isHost,
  advancing,
  onNext
}: MultiplayerRoundResultProps) {
  const view = game.modeView as ClassicMultiplayerGameView
  const now = useNow(250)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mapPadding, setMapPadding] = useState<PaddingOptions | null>(null)
  const isLastRound = round.roundNumber === view.roundsCount
  const secondsLeft = nextAt != null ? Math.max(0, Math.ceil((nextAt - now) / 1000)) : null
  const pairs = useMemo<ResultPair[]>(() => {
    if (!round.location) {
      return []
    }

    return [
      {
        location: round.location,
        guesses: round.guesses.flatMap((playerGuess) => {
          const player = game.players.find((candidate) => candidate.userId === playerGuess.userId)

          return playerGuess.guess
            ? [
                {
                  position: playerGuess.guess,
                  label: getPlayerInitial(player?.name ?? '?'),
                  color: colors.get(playerGuess.userId)
                }
              ]
            : []
        })
      }
    ]
  }, [round, game.players, colors])
  const entries = view.standings.map((standing): ScoreboardEntry => {
    const playerGuess = round.guesses.find((candidate) => candidate.userId === standing.userId)

    return {
      userId: standing.userId,
      position: standing.position,
      score: standing.score,
      roundScore: playerGuess?.score ?? 0,
      detail: playerGuess?.distanceMeters != null ? `a ${formatDistance(playerGuess.distanceMeters)}` : 'Sin respuesta'
    }
  })

  // Frame the pins in the area left visible above the result panel.
  useLayoutEffect(() => {
    const panelHeight = panelRef.current?.offsetHeight ?? 0

    setMapPadding({ top: 90, bottom: Math.min(panelHeight + 60, window.innerHeight * 0.7), left: 50, right: 50 })
  }, [])

  return (
    <div className="multiplayer-round-result">
      {mapPadding && <ResultMap pairs={pairs} className="map" padding={mapPadding} />}
      <GamePanel ref={panelRef} className="panel" title={`Ronda ${round.roundNumber}`} accent="cyan">
        <div className="place">
          <span className="flag">{countryFlag(round.countryCode)}</span>
          <span>{round.placeName}</span>
        </div>
        <Scoreboard
          entries={entries}
          players={game.players}
          colors={colors}
          highlightUserId={userId}
          className="standings"
        />
        <div className="footer">
          {secondsLeft != null && (
            <span className="next">
              {isLastRound ? 'Resultados' : 'Siguiente ronda'} en {secondsLeft} s
            </span>
          )}
          {isHost && (
            <GameButton
              color={isLastRound ? 'magenta' : 'gold'}
              size="small"
              startIcon={<SkipNextIcon />}
              loading={advancing}
              onClick={onNext}
            >
              {isLastRound ? 'Ver resultados' : 'Siguiente'}
            </GameButton>
          )}
        </div>
      </GamePanel>
    </div>
  )
}
