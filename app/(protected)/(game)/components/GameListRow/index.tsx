'use client'

import './index.scss'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import StarIcon from '@mui/icons-material/Star'
import classNames from 'classnames'
import Link from 'next/link'
import ScoreBar from '@/app/(protected)/(game)/components/ScoreBar'
import { GameListItem } from '@/app/(protected)/(game)/models/GameListItem'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { localizeMapName } from '@/app/(protected)/(game)/utils/mapText'
import { formatPosition } from '@/app/(protected)/(game)/utils/players'
import { formatScore, getGameStars } from '@/app/(protected)/(game)/utils/score'
import { LOCALE_TAGS } from '@/app/i18n/config'
import { useI18n } from '@/app/i18n/I18nProvider'

interface GameListRowProps {
  game: GameListItem
  /** Detailed variant (Mis partidas): stars and a score bar. */
  detailed?: boolean
}

/**
 * One game of the player's history. Every game opens its screen: the summary
 * of finished games, or the game itself to keep playing (from any device —
 * games live in the server).
 */
export default function GameListRow({ game, detailed }: GameListRowProps) {
  const { t, locale } = useI18n()
  const formatDate = new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format
  const finished = game.status === GameStatus.FINISHED
  const inProgress = game.status === GameStatus.IN_PROGRESS
  const multiplayer = game.playersCount > 1
  const stars = game.maxScore ? getGameStars(game.score, game.maxScore) : null

  return (
    <Link href={`/game/${game.id}`} className="game-list-row">
      <div className="info">
        <span className="map">{localizeMapName(t, game.mapName)}</span>
        <span className="date">{formatDate(new Date(game.createdAt))}</span>
        {detailed && finished && game.maxScore != null && (
          <ScoreBar value={game.score} max={game.maxScore} className="bar" />
        )}
      </div>
      {finished && (
        <div className="result">
          {multiplayer && game.position != null && (
            <span className="position">
              {t('myGames.position', { position: formatPosition(game.position, locale), total: game.playersCount })}
            </span>
          )}
          {detailed && stars != null && (
            <span className="stars" aria-label={t('myGames.stars', { count: stars })}>
              {[1, 2, 3].map((star) => (
                <StarIcon key={star} className={classNames('star', { earned: star <= stars })} />
              ))}
            </span>
          )}
          <span className="score">{formatScore(game.score, locale)}</span>
        </div>
      )}
      {inProgress && (
        <span className="resume">{t('myGames.resume', { done: game.completedSteps, total: game.totalSteps })}</span>
      )}
      {game.status === GameStatus.LOBBY && <span className="status">{t('myGames.waitingRoom')}</span>}
      <ChevronRightIcon className="chevron" />
    </Link>
  )
}
