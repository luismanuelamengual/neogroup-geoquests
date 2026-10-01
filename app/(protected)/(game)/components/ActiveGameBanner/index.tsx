'use client'

import './index.scss'
import GroupsIcon from '@mui/icons-material/Groups'
import { useCallback } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import GameButton from '@/app/components/GameButton'
import { useLoadingData } from '@/app/hooks/useLoadingData'
import { useT } from '@/app/i18n/I18nProvider'

/** Main menu banner shown while the player is in a multiplayer game (waiting or playing), to get back to it. */
export default function ActiveGameBanner() {
  const t = useT()
  const { getActiveGame } = useGames()
  const loadActiveGame = useCallback(() => getActiveGame(), [getActiveGame])
  const { data: game } = useLoadingData(loadActiveGame, [loadActiveGame], null)

  if (!game) {
    return null
  }

  return (
    <div className="active-game-banner">
      <GroupsIcon className="icon" />
      <span className="text">
        {game.status === GameStatus.LOBBY ? t('game.activeLobby') : t('game.activeInProgress')}
      </span>
      <GameButton color="magenta" size="small" href={`/game/${game.id}`}>
        {t('game.back')}
      </GameButton>
    </div>
  )
}
