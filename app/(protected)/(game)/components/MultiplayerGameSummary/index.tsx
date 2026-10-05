'use client'

import './index.scss'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupsIcon from '@mui/icons-material/Groups'
import HomeIcon from '@mui/icons-material/Home'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import Scoreboard from '@/app/(protected)/(game)/components/Scoreboard'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { ClassicMultiplayerGameView } from '@/app/(protected)/(game)/models/ClassicMultiplayerGameView'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { getModeColor } from '@/app/(protected)/(game)/utils/modeColor'
import { MULTIPLAYER_MENU_PATH } from '@/app/(protected)/(game)/utils/modeRoutes'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatPosition, getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { formatDistance, formatScore } from '@/app/(protected)/(game)/utils/score'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import type { Locale } from '@/app/i18n/config'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { Translator } from '@/app/i18n/translate'

/** Headline of the summary for the player looking at it. */
function getHeadline(outcome: GameOutcome | null, position: number | null, t: Translator, locale: Locale): string {
  if (outcome === GameOutcome.WON) {
    return t('game.won')
  }

  if (outcome === GameOutcome.DRAW) {
    return t('game.draw')
  }

  return position != null ? t('game.finished', { position: formatPosition(position, locale) }) : t('game.gameOver')
}

/**
 * End of a classic multiplayer game: final positions (stored for every player
 * in the server), the player's answers on the map and every round with its
 * best guess.
 */
export default function MultiplayerGameSummary() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { createGame } = useGames()
  const game = useGameStore((state) => state.game)!
  const userId = useUserStore((state) => state.user?.id ?? null)
  const [starting, setStarting] = useState(false)
  const view = game.modeView as ClassicMultiplayerGameView
  const colors = useMemo(() => getPlayerColors(game.players), [game.players])
  const me = game.players.find((player) => player.userId === userId)
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
    <div className="multiplayer-game-summary">
      {starting && <Loading message={t('picker.preparingRoom')} />}
      <GamePanel className="hero" title={t('game.gameOver')} accent="magenta">
        <div className="mode">{getMapName(t, game.mapSlug)}</div>
        <div className="headline">
          <EmojiEventsIcon className="trophy" />
          {getHeadline(me?.outcome ?? null, me?.position ?? null, t, locale)}
        </div>
        <Scoreboard
          entries={game.players.map((player) => ({
            userId: player.userId,
            position: player.position ?? game.players.length,
            score: player.score
          }))}
          players={game.players}
          colors={colors}
          highlightUserId={userId}
          className="final-standings"
        />
        <div className="actions">
          <GameButton
            size="large"
            color={getModeColor(game.mode)}
            startIcon={<GroupsIcon />}
            loading={starting}
            onClick={handlePlayAgain}
          >
            {t('game.anotherWithFriends')}
          </GameButton>
          <GameButton color="ghost" size="large" startIcon={<HomeIcon />} href={MULTIPLAYER_MENU_PATH}>
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
              const bestPlayer = game.players.find((player) => player.userId === best?.userId)
              const mine = round.guesses.find((playerGuess) => playerGuess.userId === userId)

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
                            name: bestPlayer?.name ?? t('common.player'),
                            distance: formatDistance(best.distanceMeters, locale)
                          })
                        : t('game.nobodyAnswered')}
                    </span>
                  </div>
                  <span className="score">{formatScore(mine?.score ?? 0, locale)}</span>
                </li>
              )
            })}
          </ol>
        </GamePanel>
      </div>
    </div>
  )
}
