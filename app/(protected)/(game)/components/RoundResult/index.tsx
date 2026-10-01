'use client'

import './index.scss'
import type { PaddingOptions } from 'maplibre-gl'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { useCountUp } from '@/app/(protected)/(game)/hooks/useCountUp'
import { RoundView } from '@/app/(protected)/(game)/models/RoundView'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatDistance, formatScore, getRoundVerdict } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Stands for the distance while the sentence is split to show it in bold. */
const DISTANCE_MARKER = '\u0000'

interface RoundResultProps {
  round: RoundView
  maxRoundScore: number
  isLastRound: boolean
  onContinue: () => void
}

/** Overlay shown after a guess: map with the answer, distance, animated score and the "next" button. */
export default function RoundResult({ round, maxRoundScore, isLastRound, onContinue }: RoundResultProps) {
  const { t, locale } = useI18n()
  const score = round.score ?? 0
  const animatedScore = useCountUp(score, 1300, 500)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mapPadding, setMapPadding] = useState<PaddingOptions | null>(null)
  const pairs = useMemo<ResultPair[]>(
    () =>
      round.location ? [{ location: round.location, guesses: round.guess ? [{ position: round.guess }] : [] }] : [],
    [round.location, round.guess]
  )

  // Frame the pins in the area left visible above the result panel.
  useLayoutEffect(() => {
    const panelHeight = panelRef.current?.offsetHeight ?? 0

    setMapPadding({ top: 90, bottom: Math.min(panelHeight + 60, window.innerHeight * 0.7), left: 50, right: 50 })
  }, [])

  return (
    <div className="round-result">
      {mapPadding && <ResultMap pairs={pairs} className="map" padding={mapPadding} />}
      <GamePanel
        ref={panelRef}
        className="panel"
        title={t('game.roundNumber', { number: round.roundNumber })}
        accent="cyan"
      >
        <div className="verdict">{round.timedOut ? t('result.timeUp') : getRoundVerdict(score, maxRoundScore, t)}</div>
        <div className="place">
          <span className="flag">{countryFlag(round.countryCode)}</span>
          <span>{round.placeName}</span>
        </div>
        <div className="distance">
          {round.distanceMeters != null ? (
            <>
              {t('result.yourMark', { distance: DISTANCE_MARKER })
                .split(DISTANCE_MARKER)
                .flatMap((part, index) =>
                  index === 0
                    ? [part]
                    : [<strong key={index}>{formatDistance(round.distanceMeters!, locale)}</strong>, part]
                )}
            </>
          ) : (
            t('result.noMark')
          )}
        </div>
        <div className="score">
          <span className="value">{formatScore(animatedScore, locale)}</span>
          <span className="max">
            / {formatScore(maxRoundScore, locale)} {t('common.points')}
          </span>
        </div>
        <ScoreBar value={animatedScore} max={maxRoundScore} />
        <GameButton color={isLastRound ? 'magenta' : 'gold'} size="large" fullWidth onClick={onContinue} autoFocus>
          {isLastRound ? t('result.seeSummary') : t('result.nextRound')}
        </GameButton>
      </GamePanel>
    </div>
  )
}
