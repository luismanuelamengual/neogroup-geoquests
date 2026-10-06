'use client'

import './index.scss'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import DetectiveHowTo from '@/app/(protected)/(game)/components/DetectiveHowTo'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import { useGames } from '@/app/(protected)/(game)/hooks/useGames'
import { DETECTIVE_DIFFICULTY_LEVELS, DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import {
  DEFAULT_DETECTIVE_DIFFICULTY,
  DETECTIVE_DIFFICULTIES
} from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import { getModeMenuPath } from '@/app/(protected)/(game)/utils/modeRoutes'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/**
 * Page of the detective mode (/play/detective), instead of the map picker:
 * it is always played in the same map, so it only tells what the mode is
 * about and opens a new case of the difficulty chosen (easy, medium or hard:
 * the rules are in utils/detectiveDifficulty.ts).
 */
export default function DetectiveIntro({ mode }: { mode: GameModeView }) {
  const t = useT()
  const router = useRouter()
  const { createGame } = useGames()
  const [creating, setCreating] = useState(false)
  const [difficulty, setDifficulty] = useState<DetectiveDifficulty>(DEFAULT_DETECTIVE_DIFFICULTY)

  const handleNewCase = async () => {
    setCreating(true)

    try {
      const game = await createGame(null, mode.mode, { difficulty })

      router.push(`/game/${game.id}`)
    } catch {
      setCreating(false)
    }
  }

  return (
    <div className="detective-intro">
      {creating && <Loading message={t('detective.intro.preparing')} />}
      <Link href={getModeMenuPath(mode)} className="back">
        <ArrowBackIcon fontSize="small" /> {t('common.menu')}
      </Link>
      <header className="header">
        <GameModeIcon mode={mode.mode} className="icon" />
        <div className="heading">
          <h1 className="title">{mode.name}</h1>
          <p className="subtitle">{t('detective.intro.subtitle')}</p>
        </div>
      </header>
      <GamePanel className="card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mode.image} alt="" className="image" />
        <div className="content">
          <p className="description">{mode.description}</p>
          <h2 className="how-to-title">{t('detective.intro.difficulty')}</h2>
          <div className="difficulties" role="radiogroup" aria-label={t('detective.intro.difficulty')}>
            {DETECTIVE_DIFFICULTY_LEVELS.filter((level) => mode.configurable.difficulty?.includes(level)).map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={level === difficulty}
                  className={classNames('difficulty', level, { selected: level === difficulty })}
                  disabled={creating}
                  onClick={() => setDifficulty(level)}
                >
                  <span className="name">{t(`detective.difficulty.${level}.name` as MessageKey)}</span>
                  <span className="summary">{t(`detective.difficulty.${level}.summary` as MessageKey)}</span>
                </button>
              )
            )}
          </div>
          <h2 className="how-to-title">{t('detective.intro.howTo')}</h2>
          <DetectiveHowTo settings={DETECTIVE_DIFFICULTIES[difficulty]} />
          <GameButton
            size="large"
            fullWidth
            className="new-case"
            startIcon={<TravelExploreIcon />}
            loading={creating}
            onClick={handleNewCase}
          >
            {t('detective.intro.newCase')}
          </GameButton>
        </div>
      </GamePanel>
    </div>
  )
}
