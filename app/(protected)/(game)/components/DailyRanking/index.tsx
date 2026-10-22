'use client'

import './index.scss'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import IconButton from '@mui/material/IconButton'
import { useCallback, useState } from 'react'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import DailyLeaderboard from '@/app/(protected)/(game)/components/DailyLeaderboard'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { getMapName } from '@/app/(protected)/(game)/utils/mapText'
import { useLoadingData } from '@/app/hooks/useLoadingData'
import { LOCALE_TAGS } from '@/app/i18n/config'
import { useI18n } from '@/app/i18n/I18nProvider'

/**
 * "Ranking" section (/ranking): the ranking of today's challenge and, going
 * back day by day, the ones of the days before. The challenge itself is only
 * played from the "Jugar" menu (DailyChallengeCard).
 */
export default function DailyRanking() {
  const { t, locale } = useI18n()
  const { getDailyLeaderboard } = useGames()
  // Null: today's.
  const [day, setDay] = useState<string | null>(null)
  const loadBoard = useCallback(() => getDailyLeaderboard({ day }), [day, getDailyLeaderboard])
  const { data: board, loading } = useLoadingData(loadBoard, [loadBoard], null)
  const date = board
    ? new Date(`${board.day}T00:00:00Z`).toLocaleDateString(LOCALE_TAGS[locale], {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    : ''

  return (
    <div className="daily-ranking">
      <section className="hero">
        <h1 className="title">{t('ranking.title')}</h1>
        <p className="subtitle">{t('ranking.subtitle')}</p>
      </section>
      {board && (
        <>
          <div className="day-picker">
            <IconButton
              className="arrow"
              disabled={!board.previousDay || loading}
              onClick={() => setDay(board.previousDay)}
              aria-label={t('ranking.previousDay')}
            >
              <ChevronLeftIcon />
            </IconButton>
            <div className="day">
              <span className="label">{board.isToday ? t('ranking.today') : date}</span>
              <span className="map">{getMapName(t, board.mapSlug)}</span>
            </div>
            <IconButton
              className="arrow"
              disabled={!board.nextDay || loading}
              onClick={() => setDay(board.nextDay)}
              aria-label={t('ranking.nextDay')}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <DailyLeaderboard board={board} />
        </>
      )}
      <AdSlot />
    </div>
  )
}
