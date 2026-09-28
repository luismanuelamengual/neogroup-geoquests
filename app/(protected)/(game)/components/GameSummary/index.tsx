'use client'

import './index.scss'
import HistoryIcon from '@mui/icons-material/History'
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
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameListItem, GameView } from '@/app/(protected)/(game)/models/GameView'
import { loadGameSession, saveGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatDistance, formatScore, getGameStars, MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'

/**
 * End of game screen: stars, total score, every answer on the map and the
 * per-round breakdown. The rounds are not stored on the server: the breakdown
 * comes from this device's storage; elsewhere (or once it was pruned) only the
 * final result from the database is shown.
 */
export default function GameSummary({ gameId }: { gameId: number }) {
  const router = useRouter()
  const { getGameResult, startGame } = useGames()
  const [game, setGame] = useState<GameView | null>(null)
  const [result, setResult] = useState<GameListItem | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [starting, setStarting] = useState(false)
  const animatedTotal = useCountUp(result?.totalScore ?? 0, 1800, 300)
  const pairs = useMemo<ResultPair[]>(
    () =>
      (game?.rounds ?? []).flatMap((round) =>
        round.location ? [{ location: round.location, guess: round.guess, label: String(round.roundNumber) }] : []
      ),
    [game]
  )

  useEffect(() => {
    const stored = loadGameSession(gameId)

    if (stored?.game.status === GameStatus.FINISHED) {
      setGame(stored.game)
      setResult({
        id: stored.game.id,
        questId: stored.game.questId,
        questName: stored.game.questName,
        status: stored.game.status,
        roundsCount: stored.game.roundsCount,
        playedRounds: stored.game.roundsCount,
        totalScore: stored.game.totalScore,
        maxScore: stored.game.maxScore,
        createdAt: stored.game.createdAt
      })

      return
    }

    getGameResult(gameId)
      .then((gameResult) => {
        if (gameResult.status !== GameStatus.FINISHED) {
          router.replace(`/game/${gameId}`)

          return
        }

        setResult(gameResult)
      })
      .catch(() => setLoadError(true))
  }, [gameId, getGameResult, router])

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

  if (!result) {
    return <Loading message="Contando puntos..." />
  }

  const stars = getGameStars(result.totalScore, result.maxScore)

  const handlePlayAgain = async () => {
    setStarting(true)

    try {
      const session = await startGame(result.questId)

      saveGameSession(session)
      router.push(`/game/${session.game.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="game-summary">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <GamePanel className="hero" title="¡Partida terminada!" accent="magenta">
        <div className="mode">{result.questName}</div>
        <div className="stars">
          {[1, 2, 3].map((star) => (
            <StarIcon key={star} className={classNames('star', { earned: star <= stars })} />
          ))}
        </div>
        <div className="total">
          <span className="value">{formatScore(animatedTotal)}</span>
          <span className="max">/ {formatScore(result.maxScore)} pts</span>
        </div>
        <ScoreBar value={animatedTotal} max={result.maxScore} />
        <div className="actions">
          <GameButton size="large" startIcon={<ReplayIcon />} loading={starting} onClick={handlePlayAgain}>
            Jugar de nuevo
          </GameButton>
          <GameButton color="ghost" size="large" startIcon={<HomeIcon />} href="/home">
            Menú
          </GameButton>
          <GameButton color="cyan" size="large" startIcon={<HistoryIcon />} href="/games">
            Mis partidas
          </GameButton>
        </div>
      </GamePanel>
      {!game && (
        <p className="no-details">
          El detalle de cada ronda solo queda guardado en el dispositivo donde jugaste la partida.
        </p>
      )}
      {game && (
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
                    <span className="distance">
                      {round.distanceMeters != null
                        ? formatDistance(round.distanceMeters)
                        : 'Sin respuesta: se acabó el tiempo'}
                    </span>
                    <ScoreBar value={round.score ?? 0} max={MAX_ROUND_SCORE} className="bar" />
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
      )}
    </div>
  )
}
