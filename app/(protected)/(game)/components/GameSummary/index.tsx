'use client'

import './index.scss'
import HomeIcon from '@mui/icons-material/Home'
import ReplayIcon from '@mui/icons-material/Replay'
import StarIcon from '@mui/icons-material/Star'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { useCountUp } from '@/app/(protected)/(game)/hooks/useCountUp'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { getGameModeConfig } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatDistance, formatScore, getGameStars } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'

/** End of game screen: stars, total score, every answer on the map and the per-round breakdown. */
export default function GameSummary({ gameId }: { gameId: number }) {
  const router = useRouter()
  const { getGame, startGame } = useGames()
  const [game, setGame] = useState<GameView | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [starting, setStarting] = useState(false)
  const animatedTotal = useCountUp(game?.totalScore ?? 0, 1800, 300)
  const pairs = useMemo<ResultPair[]>(
    () =>
      (game?.rounds ?? []).flatMap((round) =>
        round.location ? [{ location: round.location, guess: round.guess, label: String(round.roundNumber) }] : []
      ),
    [game]
  )

  useEffect(() => {
    getGame(gameId)
      .then((loadedGame) => {
        if (loadedGame.status !== GameStatus.FINISHED) {
          router.replace(`/game/${gameId}`)

          return
        }

        setGame(loadedGame)
      })
      .catch(() => setLoadError(true))
  }, [gameId, getGame, router])

  if (loadError) {
    return (
      <div className="game-summary">
        <GamePanel className="error">
          <p>No pudimos cargar la partida.</p>
          <GameButton href="/home">Volver al menú</GameButton>
        </GamePanel>
      </div>
    )
  }

  if (!game) {
    return <Loading message="Contando puntos..." />
  }

  const mode = getGameModeConfig(game.mode)
  const stars = getGameStars(game.totalScore, game.maxScore)

  const handlePlayAgain = async () => {
    setStarting(true)

    try {
      const newGame = await startGame(game.mode)

      router.push(`/game/${newGame.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="game-summary">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <GamePanel className="hero" title="¡Partida terminada!" accent="magenta">
        <div className="mode">{mode.name}</div>
        <div className="stars">
          {[1, 2, 3].map((star) => (
            <StarIcon key={star} className={classNames('star', { earned: star <= stars })} />
          ))}
        </div>
        <div className="total">
          <span className="value">{formatScore(animatedTotal)}</span>
          <span className="max">/ {formatScore(game.maxScore)} pts</span>
        </div>
        <ScoreBar value={animatedTotal} max={game.maxScore} />
        <div className="actions">
          <GameButton size="large" startIcon={<ReplayIcon />} loading={starting} onClick={handlePlayAgain}>
            Jugar de nuevo
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
            {game.rounds.map((round) => (
              <li key={round.roundNumber} className="round">
                <span className="number">{round.roundNumber}</span>
                <div className="info">
                  <span className="place">
                    {countryFlag(round.countryCode)} {round.placeName}
                  </span>
                  <span className="distance">{formatDistance(round.distanceMeters ?? 0)}</span>
                  <ScoreBar value={round.score ?? 0} max={mode.score.maxScore} className="bar" />
                </div>
                <span className="score">{formatScore(round.score ?? 0)}</span>
              </li>
            ))}
          </ol>
          <div className="rounds-total">
            <span>Total</span>
            <span>{formatScore(game.totalScore)}</span>
          </div>
        </GamePanel>
      </div>
    </div>
  )
}
