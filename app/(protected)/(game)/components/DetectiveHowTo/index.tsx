'use client'

import './index.scss'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import { MAX_MISTAKES, WITNESS_MINUTES } from '@/app/(protected)/(game)/utils/detective'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { useT } from '@/app/i18n/I18nProvider'

/** The rules of the detective mode in four steps (mode page and case briefing). */
export default function DetectiveHowTo({ settings }: { settings: DetectiveGameSettings }) {
  const t = useT()
  const steps = [
    { icon: <VisibilityIcon />, text: t('detective.howTo.eyes') },
    { icon: <RecordVoiceOverIcon />, text: t('detective.howTo.witnesses', { time: formatDuration(WITNESS_MINUTES) }) },
    {
      icon: <FlightTakeoffIcon />,
      text: t('detective.howTo.travel', { options: settings.options, mistakes: MAX_MISTAKES })
    },
    { icon: <SportsScoreIcon />, text: t('detective.howTo.catch', { hops: settings.hops }) }
  ]

  return (
    <ol className="detective-how-to">
      {steps.map(({ icon, text }, index) => (
        <li key={index} className="step">
          <span className="icon" aria-hidden="true">
            {icon}
          </span>
          <span className="text">{text}</span>
        </li>
      ))}
    </ol>
  )
}
