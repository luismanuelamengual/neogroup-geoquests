'use client'

import './index.scss'
import CheckIcon from '@mui/icons-material/Check'
import classNames from 'classnames'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import PlayerAvatar from '@/app/components/PlayerAvatar'

interface PlayersStatusProps {
  players: GamePlayerView[]
  /** Players who already guessed the current round (never where). */
  guessedUserIds: number[]
  colors: Map<number, string>
  className?: string
}

/** Row of the players still in the game, with a check on those who already guessed the current round. */
export default function PlayersStatus({ players, guessedUserIds, colors, className }: PlayersStatusProps) {
  return (
    <ul className={classNames('players-status', className)}>
      {players
        .filter((player) => player.status === GamePlayerStatus.ACTIVE)
        .map((player) => {
          const guessed = guessedUserIds.includes(player.userId)

          return (
            <li
              key={player.userId}
              className={classNames('player', { guessed })}
              title={`${player.name}${guessed ? ': ya respondió' : ''}`}
            >
              <PlayerAvatar name={player.name} color={colors.get(player.userId)} className="avatar" />
              {guessed && <CheckIcon className="check" />}
            </li>
          )
        })}
    </ul>
  )
}
