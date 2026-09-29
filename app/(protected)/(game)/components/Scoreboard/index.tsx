'use client'

import './index.scss'
import classNames from 'classnames'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import { formatPosition } from '@/app/(protected)/(game)/utils/players'
import { formatScore } from '@/app/(protected)/(game)/utils/score'
import PlayerAvatar from '@/app/components/PlayerAvatar'

/** A row of the scoreboard. */
export interface ScoreboardEntry {
  userId: number
  position: number
  score: number
  /** Points of the last round (shown as "+N"). */
  roundScore?: number
  /** Extra line under the name (e.g. the distance of the last guess). */
  detail?: string
  /** Highlighted label next to the name (e.g. "Eliminado"). */
  badge?: string
  /** Hide the score column (modes where points do not decide the position). */
  hideScore?: boolean
}

interface ScoreboardProps {
  entries: ScoreboardEntry[]
  players: GamePlayerView[]
  colors: Map<number, string>
  /** Player to highlight (the one looking). */
  highlightUserId?: number | null
  className?: string
}

/** Positions of a multiplayer game: position, avatar, name and score of every player, best first. */
export default function Scoreboard({ entries, players, colors, highlightUserId, className }: ScoreboardProps) {
  return (
    <ol className={classNames('scoreboard', className)}>
      {[...entries]
        .sort((a, b) => a.position - b.position)
        .map((entry) => {
          const player = players.find((candidate) => candidate.userId === entry.userId)
          const name = player?.name ?? 'Jugador'

          return (
            <li
              key={entry.userId}
              className={classNames('entry', {
                me: entry.userId === highlightUserId,
                left: player?.status === GamePlayerStatus.LEFT,
                first: entry.position === 1
              })}
            >
              <span className="position">{formatPosition(entry.position)}</span>
              <PlayerAvatar name={name} color={colors.get(entry.userId)} className="avatar" />
              <span className="info">
                <span className="name">
                  {name}
                  {player?.status === GamePlayerStatus.LEFT && <span className="left-tag"> (se fue)</span>}
                </span>
                {entry.detail && <span className="detail">{entry.detail}</span>}
              </span>
              {entry.badge && <span className="badge">{entry.badge}</span>}
              {entry.roundScore != null && <span className="round-score">+{formatScore(entry.roundScore)}</span>}
              {!entry.hideScore && <span className="score">{formatScore(entry.score)}</span>}
            </li>
          )
        })}
    </ol>
  )
}
