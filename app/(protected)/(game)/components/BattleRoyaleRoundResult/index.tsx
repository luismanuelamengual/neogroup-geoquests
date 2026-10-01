'use client'

import './index.scss'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import type { PaddingOptions } from 'maplibre-gl'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import Scoreboard, { ScoreboardEntry } from '@/app/(protected)/(game)/components/Scoreboard'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'
import { BattleRoyaleGameView } from '@/app/(protected)/(game)/models/BattleRoyaleGameView'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { MultiplayerRoundView } from '@/app/(protected)/(game)/models/MultiplayerRoundView'
import { getModeColor } from '@/app/(protected)/(game)/utils/modeColor'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { getPlayerInitial } from '@/app/(protected)/(game)/utils/players'
import { formatDistance } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'

interface BattleRoyaleRoundResultProps {
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
 * Result of a battle royale round, shown to everybody at the same time: the
 * answer and the pins of the players who played it, ordered from the closest
 * to the farthest, and who was eliminated.
 */
export default function BattleRoyaleRoundResult({
  game,
  round,
  colors,
  userId,
  nextAt,
  isHost,
  advancing,
  onNext
}: BattleRoyaleRoundResultProps) {
  const { t, locale } = useI18n()
  const view = game.modeView as BattleRoyaleGameView
  const now = useNow(250)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mapPadding, setMapPadding] = useState<PaddingOptions | null>(null)
  const nameOf = (playerId: number) =>
    game.players.find((player) => player.userId === playerId)?.name ?? t('common.player')
  const isLast = view.aliveUserIds.length <= 1
  const secondsLeft = nextAt != null ? Math.max(0, Math.ceil((nextAt - now) / 1000)) : null
  const pairs = useMemo<ResultPair[]>(() => {
    if (!round.location) {
      return []
    }

    return [
      {
        location: round.location,
        guesses: round.guesses.flatMap((playerGuess) =>
          playerGuess.guess
            ? [
                {
                  position: playerGuess.guess,
                  label: getPlayerInitial(game.players.find((p) => p.userId === playerGuess.userId)?.name ?? '?'),
                  color: colors.get(playerGuess.userId)
                }
              ]
            : []
        )
      }
    ]
  }, [round, game.players, colors])
  const entries = round.guesses.map((playerGuess, index): ScoreboardEntry => ({
    userId: playerGuess.userId,
    position: index + 1,
    score: playerGuess.score,
    detail:
      playerGuess.distanceMeters != null
        ? t('game.at', { distance: formatDistance(playerGuess.distanceMeters, locale) })
        : t('game.noAnswer'),
    badge: view.eliminatedThisRound.includes(playerGuess.userId) ? t('game.eliminatedBadge') : undefined,
    hideScore: true
  }))

  // Frame the pins in the area left visible above the result panel.
  useLayoutEffect(() => {
    const panelHeight = panelRef.current?.offsetHeight ?? 0

    setMapPadding({ top: 90, bottom: Math.min(panelHeight + 60, window.innerHeight * 0.7), left: 50, right: 50 })
  }, [])

  return (
    <div className="battle-royale-round-result">
      {mapPadding && <ResultMap pairs={pairs} className="map" padding={mapPadding} />}
      <GamePanel
        ref={panelRef}
        className="panel"
        title={t('game.roundNumber', { number: round.roundNumber })}
        accent="magenta"
      >
        <div className="place">
          <span className="flag">{countryFlag(round.countryCode)}</span>
          <span>{round.placeName}</span>
        </div>
        <div className="fallen">
          {view.eliminatedThisRound.length === 0
            ? t('result.nobodyEliminated')
            : t('result.eliminated', {
                count: view.eliminatedThisRound.length,
                names: view.eliminatedThisRound.map(nameOf).join(', ')
              })}
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
              {t('result.nextRoundIn', {
                what: isLast ? t('result.results') : t('result.nextRound'),
                seconds: secondsLeft
              })}
            </span>
          )}
          {!isLast && (
            <span className="alive">
              {t('game.remaining')} {view.aliveUserIds.length}
            </span>
          )}
          {isHost && (
            <GameButton
              color={getModeColor(game.mode)}
              size="small"
              startIcon={<SkipNextIcon />}
              loading={advancing}
              onClick={onNext}
            >
              {isLast ? t('result.seeResults') : t('result.next')}
            </GameButton>
          )}
        </div>
      </GamePanel>
    </div>
  )
}
