'use client'

import './index.scss'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { useNow } from '@/app/(protected)/(game)/hooks/useNow'
import { getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { formatScore, formatTimeLimit } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import Loading from '@/app/components/Loading'
import { useLoadingData } from '@/app/hooks/useLoadingData'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Medals of the podium of the day. */
const MEDALS = ['🥇', '🥈', '🥉']
/** How many players of the ranking the card shows. */
const PODIUM_SIZE = 3

/** "05:12:33" — time left until the next challenge. */
function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`
}

/**
 * Today's challenge, on top of the "Jugar" menu: play it (once a day), get back
 * to it, or see how it went and how long until the next one — with the podium
 * of the day and the way to the whole ranking (/ranking). While it loads, a
 * placeholder of the card.
 */
export default function DailyChallengeCard() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { getDailyChallenge, playDailyChallenge, getDailyLeaderboard } = useGames()
  const [reload, setReload] = useState(0)
  const [starting, setStarting] = useState(false)
  const loadChallenge = useCallback(() => getDailyChallenge(), [getDailyChallenge])
  const { data: daily, error } = useLoadingData(loadChallenge, [loadChallenge, reload], null)
  const loadBoard = useCallback(() => getDailyLeaderboard(), [getDailyLeaderboard])
  const { data: board } = useLoadingData(loadBoard, [loadBoard, reload], null)
  const now = useNow(1000)
  const msToNext = daily ? new Date(daily.nextChallengeAt).getTime() - now : 0
  const reloadedFor = useRef<string | null>(null)

  // A new day: a new challenge (asked once per day, even if the clock of the device is ahead of the server).
  useEffect(() => {
    if (daily && msToNext <= 0 && reloadedFor.current !== daily.nextChallengeAt) {
      reloadedFor.current = daily.nextChallengeAt
      setReload((value) => value + 1)
    }
  }, [daily, msToNext])

  const header = (
    <div className="header">
      <CalendarTodayIcon className="icon" />
      <h2 className="title">{t('daily.title')}</h2>
      <span className="badge">{t('daily.badge')}</span>
    </div>
  )

  if (!daily) {
    // Not available (e.g. offline): the menu goes on without it.
    if (error) {
      return null
    }

    return (
      <section className="daily-challenge-card loading" aria-busy="true" aria-label={t('common.loading')}>
        {header}
        <span className="placeholder line" />
        <span className="placeholder line short" />
        <span className="placeholder button" />
      </section>
    )
  }

  const handlePlay = async () => {
    setStarting(true)

    try {
      const game = await playDailyChallenge()

      router.push(`/game/${game.id}`)
    } catch {
      setStarting(false)
      setReload((value) => value + 1)
    }
  }

  const done = daily.status === 'finished' || daily.status === 'forfeited'

  return (
    <section className="daily-challenge-card">
      {starting && <Loading message={t('picker.searchingPlaces')} />}
      {header}
      <p className="subtitle">{t('daily.subtitle')}</p>
      <p className="rules">
        {getMapName(t, daily.mapSlug)} ·{' '}
        {t('daily.rules', { rounds: daily.roundsCount, time: formatTimeLimit(daily.timeLimitSeconds, t) })}
      </p>
      {daily.status === 'finished' && daily.score !== null && (
        <div className="result">
          <span className="label">{t('daily.yourScore')}</span>
          <span className="score">
            {formatScore(daily.score, locale)}
            <span className="max"> / {formatScore(daily.maxScore, locale)}</span>
          </span>
          {daily.rank && (
            <span className="rank">
              {t('daily.rank', { position: daily.rank.position, total: daily.rank.total })} ·{' '}
              {t('daily.top', { percent: daily.rank.topPercent })}
            </span>
          )}
        </div>
      )}
      {daily.status === 'forfeited' && <p className="forfeited">{t('daily.forfeited')}</p>}
      {board && board.top.length > 0 && (
        <div className="podium">
          <span className="podium-title">{t('daily.topTitle')}</span>
          <ol className="entries">
            {board.top.slice(0, PODIUM_SIZE).map((entry, index) => (
              <li key={index} className={classNames('entry', { me: entry.isMe })}>
                <span className="medal">{MEDALS[entry.position - 1] ?? entry.position}</span>
                <span className="name">
                  {entry.name}
                  {entry.isMe && ` (${t('daily.you')})`}
                </span>
                <span className="score">{formatScore(entry.score, locale)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="actions">
        <GameButton color="ghost" startIcon={<EmojiEventsIcon />} href="/ranking">
          {t('daily.seeRanking')}
        </GameButton>
        {done && <span className="countdown">{t('daily.nextIn', { time: formatCountdown(msToNext) })}</span>}
        {daily.status === 'available' && (
          <GameButton
            className="main-action"
            size="large"
            startIcon={<PlayArrowIcon />}
            loading={starting}
            onClick={handlePlay}
          >
            {t('daily.play')}
          </GameButton>
        )}
        {daily.status === 'inProgress' && daily.gameId !== null && (
          <GameButton className="main-action" size="large" startIcon={<PlayArrowIcon />} href={`/game/${daily.gameId}`}>
            {t('daily.resume')}
          </GameButton>
        )}
        {daily.status === 'finished' && daily.gameId !== null && (
          <GameButton className="main-action" color="ghost" href={`/game/${daily.gameId}`}>
            {t('daily.seeResult')}
          </GameButton>
        )}
      </div>
    </section>
  )
}
