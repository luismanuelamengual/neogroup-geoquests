'use client'

import './index.scss'
import HomeIcon from '@mui/icons-material/Home'
import ReplayIcon from '@mui/icons-material/Replay'
import StarIcon from '@mui/icons-material/Star'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ResultMap, { ResultPair } from '@/app/(protected)/(game)/components/ResultMap'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { useCountUp } from '@/app/(protected)/(game)/hooks/useCountUp'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { formatDistance, formatScore, getGameStars, MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'

/**
 * End of a classic game: stars, total score, every answer on the map and the
 * per-round breakdown (kept in the server, so it can be seen from any device).
 */
export default function ClassicGameSummary() {
  const router = useRouter()
  const { createGame } = useGames()
  const game = useGameStore((state) => state.game)!
  const view = game.modeView as ClassicGameView
  const [starting, setStarting] = useState(false)
  const animatedTotal = useCountUp(view.totalScore, 1800, 300)
  const stars = getGameStars(view.totalScore, view.maxScore)
  const pairs = useMemo<ResultPair[]>(
    () =>
      view.rounds.flatMap((round) =>
        round.location
          ? [
              {
                location: round.location,
                guesses: round.guess ? [{ position: round.guess }] : [],
                label: String(round.roundNumber)
              }
            ]
          : []
      ),
    [view.rounds]
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
    <div className="classic-game-summary">
      {starting && <Loading message="Buscando lugares por el mundo..." />}
      <GamePanel className="hero" title="¡Partida terminada!" accent="magenta">
        <div className="mode">{game.mapName}</div>
        <div className="stars">
          {[1, 2, 3].map((star) => (
            <StarIcon key={star} className={classNames('star', { earned: star <= stars })} />
          ))}
        </div>
        <div className="total">
          <span className="value">{formatScore(animatedTotal)}</span>
          <span className="max">/ {formatScore(view.maxScore)} pts</span>
        </div>
        <ScoreBar value={animatedTotal} max={view.maxScore} />
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
            {view.rounds.map((round) => (
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
            <span>{formatScore(view.totalScore)}</span>
          </div>
        </GamePanel>
      </div>
    </div>
  )
}
