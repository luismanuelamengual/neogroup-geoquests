'use client'

import './index.scss'
import classNames from 'classnames'
import { DailyLeaderboardView } from '@/app/(protected)/(game)/models/DailyLeaderboardView'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Ranking of a daily challenge: the player's place and the best scores of the day. */
export default function DailyLeaderboard({ board }: { board: DailyLeaderboardView }) {
  const { t, locale } = useI18n()
  const meInTop = board.top.some((entry) => entry.isMe)

  return (
    <GamePanel className="daily-leaderboard" title={t('daily.leaderboardTitle')} accent="lime">
      {board.me && (
        <div className="my-rank">
          <span className="position">{t('daily.rank', { position: board.me.position, total: board.me.total })}</span>
          <span className="top">{t('daily.top', { percent: board.me.topPercent })}</span>
        </div>
      )}
      {board.top.length === 0 ? (
        <p className="empty">{t('daily.leaderboardEmpty')}</p>
      ) : (
        <ol className="entries">
          {board.top.map((entry, index) => (
            <li key={index} className={classNames('entry', { me: entry.isMe })}>
              <span className="position">{entry.position}</span>
              <span className="name">
                {entry.name}
                {entry.isMe && ` (${t('daily.you')})`}
              </span>
              <span className="score">{formatScore(entry.score, locale)}</span>
            </li>
          ))}
          {board.me && !meInTop && (
            <li className="entry me">
              <span className="position">{board.me.position}</span>
              <span className="name">{t('daily.you')}</span>
              <span className="score">{formatScore(board.me.score, locale)}</span>
            </li>
          )}
        </ol>
      )}
    </GamePanel>
  )
}
