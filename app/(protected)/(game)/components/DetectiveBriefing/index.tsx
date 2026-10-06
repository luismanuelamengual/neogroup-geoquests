'use client'

import './index.scss'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import DetectiveHowTo from '@/app/(protected)/(game)/components/DetectiveHowTo'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { formatCaseTime } from '@/app/(protected)/(game)/utils/detectiveClock'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

interface DetectiveBriefingProps {
  gameId: number
  view: DetectiveGameView
  onAccept: () => void
}

/**
 * Presentation of a new case, before its first stage: what was stolen and
 * where, how many places the thief will go through, until when the detective
 * has, and the rules.
 */
export default function DetectiveBriefing({ gameId, view, onAccept }: DetectiveBriefingProps) {
  const t = useT()
  const place = view.origin.placeName
  const options = view.currentStage?.options.length ?? 4

  return (
    <div className="detective-briefing">
      <GamePanel
        className="dossier"
        title={`${t('detective.briefing.caseNumber', { id: gameId })} · ${t(`detective.difficulty.${view.difficulty}.name` as MessageKey)}`}
      >
        <div className="scene">
          <span className="flag" aria-hidden="true">
            {countryFlag(view.origin.countryCode)}
          </span>
          <h1 className="title">{t('detective.briefing.title', { place })}</h1>
        </div>
        <p className="story">
          {t('detective.briefing.story', {
            loot: t(`detective.loot.loot${view.loot + 1}` as MessageKey),
            place,
            hops: view.stagesCount,
            time: formatCaseTime(t, view.startMinute, 0)
          })}
        </p>
        <p className="deadline">
          {t('detective.briefing.deadline', { time: formatCaseTime(t, view.startMinute, view.timeLimitMinutes) })}
        </p>
        <DetectiveHowTo
          settings={{
            hops: view.stagesCount,
            options,
            suspects: view.suspectsCount,
            witnessMinutes: view.witnessMinutes,
            maxMistakes: view.maxMistakes
          }}
        />
        <GameButton size="large" fullWidth startIcon={<AssignmentTurnedInIcon />} onClick={onAccept}>
          {t('detective.briefing.accept')}
        </GameButton>
      </GamePanel>
    </div>
  )
}
