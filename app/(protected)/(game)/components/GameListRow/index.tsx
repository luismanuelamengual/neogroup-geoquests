'use client'

import './index.scss'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import StarIcon from '@mui/icons-material/Star'
import classNames from 'classnames'
import Link from 'next/link'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameListItem } from '@/app/(protected)/(game)/models/GameView'
import { hasGameSession } from '@/app/(protected)/(game)/utils/gameStorage'
import { formatScore, getGameStars } from '@/app/(protected)/(game)/utils/score'

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

interface GameListRowProps {
  game: GameListItem
  /** Detailed variant (Mis partidas): stars and a score bar. */
  detailed?: boolean
}

/**
 * One game of the player's history: finished games open their summary;
 * unfinished ones can be resumed only on the device where they were started
 * (the one holding their token).
 */
export default function GameListRow({ game, detailed }: GameListRowProps) {
  const finished = game.status === GameStatus.FINISHED
  const resumable = !finished && hasGameSession(game.id)
  const stars = getGameStars(game.totalScore, game.maxScore)
  const content = (
    <>
      <div className="info">
        <span className="quest">{game.questName}</span>
        <span className="date">{dateFormatter.format(new Date(game.createdAt))}</span>
        {detailed && finished && <ScoreBar value={game.totalScore} max={game.maxScore} className="bar" />}
      </div>
      {finished && (
        <div className="result">
          {detailed && (
            <span className="stars" aria-label={`${stars} estrellas`}>
              {[1, 2, 3].map((star) => (
                <StarIcon key={star} className={classNames('star', { earned: star <= stars })} />
              ))}
            </span>
          )}
          <span className="score">{formatScore(game.totalScore)}</span>
        </div>
      )}
      {resumable && (
        <span className="resume">
          Seguir ({game.playedRounds}/{game.roundsCount})
        </span>
      )}
      {!finished && !resumable && <span className="unfinished">Sin terminar</span>}
    </>
  )

  if (!finished && !resumable) {
    return <div className="game-list-row disabled">{content}</div>
  }

  return (
    <Link href={finished ? `/game/${game.id}/summary` : `/game/${game.id}`} className="game-list-row">
      {content}
      <ChevronRightIcon className="chevron" />
    </Link>
  )
}
