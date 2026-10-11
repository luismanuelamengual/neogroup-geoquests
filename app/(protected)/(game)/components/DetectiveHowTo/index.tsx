'use client'

import './index.scss'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle'
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { useT } from '@/app/i18n/I18nProvider'

/** The rules of the detective mode step by step (mode page and case briefing). */
export default function DetectiveHowTo({
  settings
}: {
  settings: Pick<
    DetectiveDifficultySettings,
    | 'hops'
    | 'options'
    | 'suspects'
    | 'witnessMinutes'
    | 'maxMistakes'
    | 'centralCalls'
    | 'centralCallMinutes'
    | 'centralCallEliminates'
  >
}) {
  const t = useT()
  const steps = [
    { icon: <PersonPinCircleIcon />, text: t('detective.howTo.eyes') },
    {
      icon: <RecordVoiceOverIcon />,
      text: t('detective.howTo.witnesses', { time: formatDuration(settings.witnessMinutes) })
    },
    {
      icon: <FlightTakeoffIcon />,
      text: t('detective.howTo.travel', { options: settings.options, mistakes: settings.maxMistakes })
    },
    ...(settings.centralCalls > 0
      ? [
          {
            icon: <PhoneInTalkIcon />,
            text: t('detective.howTo.call', {
              count: settings.centralCalls,
              eliminates: settings.centralCallEliminates,
              time: formatDuration(settings.centralCallMinutes)
            })
          }
        ]
      : []),
    { icon: <AutoAwesomeIcon />, text: t('detective.howTo.events') },
    {
      icon: <SportsScoreIcon />,
      text: t('detective.howTo.catch', { hops: settings.hops, suspects: settings.suspects })
    }
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
