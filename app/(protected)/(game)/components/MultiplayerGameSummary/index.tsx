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
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatPosition, getPlayerColors } from '@/app/(protected)/(game)/utils/players'
import { formatDistance, formatScore } from '@/app/(protected)/(game)/utils/score'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'

/** Headline of the summary for the player looking at it. */
function getHeadline(outcome: GameOutcome | null, position: number | null): string {
  if (outcome === GameOutcome.WON) {
    return '¡Ganaste!'
  }

  if (outcome === GameOutcome.DRAW) {
    return '¡Empate en el primer puesto!'
  }

  return position != null ? `Terminaste ${formatPosition(position)}` : '¡Partida terminada!'
}

/**
 * End of a classic multiplayer game: final positions (stored for every player
 * in the server), the player's answers on the map and every round with its
 * best guess.
 */
export default function MultiplayerGameSummary() {
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
      {starting && <Loading message="Preparando la sala..." />}
      <GamePanel className="hero" title="¡Partida terminada!" accent="magenta">
        <div className="mode">{game.mapName}</div>
        <div className="headline">
          <EmojiEventsIcon className="trophy" />
          {getHeadline(me?.outcome ?? null, me?.position ?? null)}
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
          <GameButton size="large" startIcon={<GroupsIcon />} loading={starting} onClick={handlePlayAgain}>
            Otra con amigos
          </GameButton>
          <GameButton color="ghost" size="large" startIcon={<HomeIcon />} href="/home">
            Menú
          </GameButton>
        </div>
      </GamePanel>
      <div className="details">
        <GamePanel className="map-panel" title="Tus respuestas" accent="cyan">
          <ResultMap pairs={pairs} className="summary-map" />
        </GamePanel>
        <GamePanel className="rounds-panel" title="Rondas" accent="gold">
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
                        ? `Mejor: ${bestPlayer?.name ?? 'Jugador'} a ${formatDistance(best.distanceMeters)}`
                        : 'Nadie respondió a tiempo'}
                    </span>
                  </div>
                  <span className="score">{formatScore(mine?.score ?? 0)}</span>
                </li>
              )
            })}
          </ol>
        </GamePanel>
      </div>
    </div>
  )
}
