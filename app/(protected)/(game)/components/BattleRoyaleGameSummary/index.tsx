'use client'

import './index.scss'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import HomeIcon from '@mui/icons-material/Home'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import Scoreboard from '@/app/(protected)/(game)/components/Scoreboard'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { BattleRoyaleGameView } from '@/app/(protected)/(game)/models/BattleRoyaleGameView'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { localizeMapName } from '@/app/(protected)/(game)/utils/mapText'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatPosition, getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { formatDistance } from '@/app/(protected)/(game)/utils/score'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import { useI18n } from '@/app/i18n/I18nProvider'

/**
 * End of a battle royale game: who was the last one standing, everybody's
 * final position (by the round they fell in), the player's answers on the
 * map and who fell in every round.
 */
export default function BattleRoyaleGameSummary() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { createGame } = useGames()
  const game = useGameStore((state) => state.game)!
  const userId = useUserStore((state) => state.user?.id ?? null)
  const [starting, setStarting] = useState(false)
  const view = game.modeView as BattleRoyaleGameView
  const colors = useMemo(() => getPlayerColors(game.players), [game.players])
  const nameOf = (playerId: number) =>
    game.players.find((player) => player.userId === playerId)?.name ?? t('common.player')
  const me = game.players.find((player) => player.userId === userId)
  const winners = view.standings.filter((standing) => standing.position === 1)
  const pairs = useMemo<ResultPair[]>(
    () =>
      view.rounds.flatMap((round) => {
        const myGuess = round.guesses.find((playerGuess) => playerGuess.userId === userId)?.guess

        return round.location
          ? [
              {
                location: round.location,
                guesses: myGuess ? [{ position: myGuess, color: userId != null ? colors.get(userId) : undefined }] : [],
                label: String(round.roundNumber)
              }
            ]
          : []
      }),
    [view.rounds, userId, colors]
  )
  let headline = t('game.gameOver')

  if (me?.outcome === GameOutcome.WON) {
    headline = t('game.wonStanding')
  } else if (me?.outcome === GameOutcome.DRAW) {
    headline = t('game.draw')
  } else if (me?.position != null) {
    headline = t('game.finished', { position: formatPosition(me.position, locale) })
  }

  const handlePlayAgain = async () => {
    if (game.mapId == null) {
      return
    }

    setStarting(true)

    try {
      const created = await createGame(game.mapId, game.mode)

      router.push(`/game/${created.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="battle-royale-game-summary">
      {starting && <Loading message={t('picker.preparingRoom')} />}
      <GamePanel className="hero" title={t('game.gameOver')} accent="magenta">
        <div className="mode">{localizeMapName(t, game.mapName)}</div>
        <div className="headline">
          <EmojiEventsIcon className="trophy" />
          {headline}
        </div>
        {winners.length === 1 && me?.outcome !== GameOutcome.WON && (
          <div className="mode">{t('game.winnerIs', { name: nameOf(winners[0].userId) })}</div>
        )}
        <Scoreboard
          entries={view.standings.map((standing) => ({
            userId: standing.userId,
            position: standing.position,
            score: standing.score,
            detail:
              standing.eliminatedInRound != null
                ? t('game.eliminatedIn', { round: standing.eliminatedInRound })
                : t('game.stoodUp'),
            hideScore: true
          }))}
          players={game.players}
          colors={colors}
          highlightUserId={userId}
          className="final-standings"
        />
        <div className="actions">
          <GameButton
            size="large"
            color="magenta"
            startIcon={<LocalFireDepartmentIcon />}
            loading={starting}
            onClick={handlePlayAgain}
          >
            {t('game.anotherGame')}
          </GameButton>
          <GameButton color="ghost" size="large" startIcon={<HomeIcon />} href="/play">
            {t('common.menu')}
          </GameButton>
        </div>
      </GamePanel>
      <div className="details">
        <GamePanel className="map-panel" title={t('game.yourAnswers')} accent="cyan">
          <ResultMap pairs={pairs} className="summary-map" />
        </GamePanel>
        <GamePanel className="rounds-panel" title={t('game.rounds')} accent="gold">
          <ol className="rounds">
            {view.rounds.map((round) => {
              const best = round.guesses[0]
              const fallen = view.standings
                .filter((standing) => standing.eliminatedInRound === round.roundNumber)
                .map((standing) => nameOf(standing.userId))

              return (
                <li key={round.roundNumber} className="round">
                  <span className="number">{round.roundNumber}</span>
                  <div className="info">
                    <span className="place">
                      {countryFlag(round.countryCode)} {round.placeName}
                    </span>
                    <span className="best">
                      {best && best.distanceMeters != null
                        ? t('game.best', {
                            name: nameOf(best.userId),
                            distance: formatDistance(best.distanceMeters, locale)
                          })
                        : t('game.nobodyAnswered')}
                    </span>
                    <span className="fallen">
                      {fallen.length > 0 ? t('game.fell', { names: fallen.join(', ') }) : t('game.nobodyFell')}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </GamePanel>
      </div>
    </div>
  )
}
