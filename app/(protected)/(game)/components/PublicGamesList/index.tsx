'use client'

import './index.scss'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import PublicIcon from '@mui/icons-material/Public'
import ReplayIcon from '@mui/icons-material/Replay'
import TimerIcon from '@mui/icons-material/Timer'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { PublicGameItem } from '@/app/(protected)/(game)/models/PublicGameItem'
import { getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import { useFocusDetector } from '@/app/hooks/useFocusDetector'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** The list of public games is refreshed this often while it is on screen. */
const REFRESH_INTERVAL_MS = 5000

/**
 * Public games of the "Multijugador" menu: the multiplayer games other
 * players made public that are waiting for players and still have room —
 * kept up to date by polling while the window is active (refreshed right away
 * when it comes back) — each one with the button to join it, no code needed.
 */
export default function PublicGamesList() {
  const t = useT()
  const router = useRouter()
  const { getPublicGames, joinPublicGame } = useGames()
  const [games, setGames] = useState<PublicGameItem[] | null>(null)
  const [joiningId, setJoiningId] = useState<number | null>(null)
  const focused = useFocusDetector()

  useEffect(() => {
    if (!focused) {
      return
    }

    let active = true
    const load = () =>
      getPublicGames()
        .then((items) => {
          if (active) {
            setGames(items)
          }
        })
        .catch(() => {
          // Polling: the next refresh tries again.
        })

    load()

    const interval = setInterval(load, REFRESH_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [focused, getPublicGames])

  const handleJoin = async (gameId: number) => {
    setJoiningId(gameId)

    try {
      const game = await joinPublicGame(gameId)

      router.push(`/game/${game.id}`)
    } catch {
      // The error toast is shown by useRequests.
      setJoiningId(null)
    }
  }

  return (
    <section className="public-games-list" aria-label={t('publicGames.title')}>
      <header className="header">
        <PublicIcon className="header-icon" />
        <div className="header-text">
          <h2 className="title">{t('publicGames.title')}</h2>
          <p className="hint">{t('publicGames.text')}</p>
        </div>
      </header>
      {games !== null && games.length === 0 && <p className="empty">{t('publicGames.empty')}</p>}
      {games !== null && games.length > 0 && (
        <ul className="games">
          {games.map((game) => (
            <li key={game.id} className="game">
              <div className="info">
                <span className="mode">
                  <GameModeIcon mode={game.mode} className="mode-icon" />
                  {t(`modes.${game.modeSlug}.name` as MessageKey)}
                </span>
                <span className="map">{getMapName(t, game.mapSlug)}</span>
                <span className="host">{t('publicGames.host', { name: game.hostName })}</span>
                <ul className="rules" aria-label={t('picker.rules')}>
                  {game.roundsPerElimination !== null ? (
                    <li className="rule">
                      <ReplayIcon className="rule-icon" />
                      {game.roundsPerElimination > 1
                        ? t('modes.eliminationEvery', { count: game.roundsPerElimination })
                        : t('modes.elimination')}
                    </li>
                  ) : (
                    game.roundsCount !== null && (
                      <li className="rule">
                        <ReplayIcon className="rule-icon" />
                        {t('modes.rounds', { count: game.roundsCount })}
                      </li>
                    )
                  )}
                  <li className="rule">
                    <TimerIcon className="rule-icon" />
                    {game.timeLimitSeconds
                      ? t('publicGames.timePerRound', { time: formatTimeLimit(game.timeLimitSeconds, t) })
                      : t('modes.noTime')}
                  </li>
                </ul>
              </div>
              <span className="players">
                {game.playersCount}/{game.maxPlayers}
              </span>
              <GameButton
                color="cyan"
                size="small"
                startIcon={<GroupAddIcon />}
                loading={joiningId === game.id}
                disabled={joiningId !== null && joiningId !== game.id}
                onClick={() => handleJoin(game.id)}
              >
                {t('publicGames.join')}
              </GameButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
