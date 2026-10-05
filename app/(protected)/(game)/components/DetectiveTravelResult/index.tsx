'use client'

import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import DetectiveMap, { DetectiveMapFlight, DetectiveMapMarker } from '@/app/(protected)/(game)/components/DetectiveMap'
import SpeechBubble from '@/app/(protected)/(game)/components/SpeechBubble'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { WITNESS_ROLES } from '@/app/(protected)/(game)/models/WitnessRole'
import { formatCaseTime, formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

/** Duration of the animation of a flight (ms), whatever its fictional length. */
const FLIGHT_MS = 2600

type Step = 'flying' | 'arrived' | 'redirecting' | 'redirected'

interface DetectiveTravelResultProps {
  gameId: number
  view: DetectiveGameView
  stageNumber: number
  onContinue: () => void
}

/**
 * The trip of a stage, after choosing a destination: the plane flies there
 * on the map. Right: the thief was there (or is caught, at the last stop).
 * Wrong: nobody saw the thief, and a second flight takes the detective to
 * the right destination (or, one mistake too many, the trail is lost there).
 * It ends telling whether the time ran out.
 */
export default function DetectiveTravelResult({ gameId, view, stageNumber, onContinue }: DetectiveTravelResultProps) {
  const t = useT()
  const played = view.playedStages.find((stage) => stage.stageNumber === stageNumber)!
  const { from, chosen, destination, travel } = played
  const [step, setStep] = useState<Step>('flying')
  const lostTrail = view.outcome === 'lostTrail'
  const finished = step === 'redirected' || (step === 'arrived' && (travel.correct || lostTrail))
  const caught = view.outcome === 'caught'
  const escaped = view.outcome === 'escaped' || lostTrail
  const showDestination = travel.correct || step === 'redirecting' || step === 'redirected'
  const markers = useMemo<DetectiveMapMarker[]>(() => {
    const list: DetectiveMapMarker[] = [
      { id: 'from', position: from, label: '★', color: '#22d3ee' },
      {
        id: 'chosen',
        position: chosen,
        label: travel.correct ? '✓' : '✗',
        variant: travel.correct ? 'target' : 'guess'
      }
    ]

    if (!travel.correct && showDestination) {
      list.push({ id: 'destination', position: destination, label: '✓', variant: 'target' })
    }

    return list
  }, [from, chosen, destination, travel.correct, showDestination])
  const flight = useMemo<DetectiveMapFlight | null>(() => {
    if (step === 'flying') {
      return {
        key: `${stageNumber}-go`,
        from,
        to: chosen,
        // White while flying: the color tells right or wrong only on arrival.
        kind: 'travel',
        durationMs: FLIGHT_MS,
        onDone: () => setStep('arrived')
      }
    }

    if (step === 'redirecting') {
      return {
        key: `${stageNumber}-redirect`,
        from: chosen,
        to: destination,
        kind: 'travel',
        durationMs: FLIGHT_MS,
        onDone: () => setStep('redirected')
      }
    }

    return null
  }, [step, stageNumber, from, chosen, destination])
  const legs = useMemo(
    () => [
      ...(step !== 'flying'
        ? [{ from, to: chosen, kind: travel.correct ? ('route' as const) : ('wrong' as const) }]
        : []),
      ...(step === 'redirected' ? [{ from: chosen, to: destination, kind: 'route' as const }] : [])
    ],
    [step, from, chosen, destination, travel.correct]
  )
  // The fictional clock moves on with each flight (the view already has the time after both).
  const departure = view.elapsedMinutes - travel.travelMinutes - travel.redirectMinutes
  const clock =
    step === 'flying'
      ? departure
      : step === 'redirected' || travel.correct
        ? view.elapsedMinutes
        : departure + travel.travelMinutes
  // A local who has not seen the thief (always the same one for this stage).
  const local = {
    seed: gameId * 7919 + stageNumber * 104729,
    role: WITNESS_ROLES[(gameId + stageNumber) % WITNESS_ROLES.length]
  }
  let message: string
  let detail: string | null = null

  if (step === 'flying') {
    message = t('detective.travel.flying', { place: chosen.placeName })
    detail = t('detective.travelPanel.duration', { time: formatDuration(travel.travelMinutes) })
  } else if (step === 'arrived' && !travel.correct) {
    message = t('detective.travel.wrong', { place: chosen.placeName })
  } else if (step === 'redirecting' || step === 'redirected') {
    message = t('detective.travel.redirect', { place: destination.placeName })
    detail = t('detective.travelPanel.duration', { time: formatDuration(travel.redirectMinutes) })
  } else {
    message = t('detective.travel.correct')
  }

  if (finished && caught) {
    message = t('detective.travel.caught')
    detail = null
  } else if (finished && lostTrail) {
    message = t('detective.travel.wrong', { place: chosen.placeName })
    detail = t('detective.travel.lostTrail')
  } else if (finished && escaped) {
    message = t('detective.travel.escaped')
    detail = null
  }

  return (
    <div className="detective-travel-result">
      <DetectiveMap
        className="map"
        markers={markers}
        legs={legs}
        flight={flight}
        fitTo={[from, chosen, ...(showDestination && !travel.correct ? [destination] : [])]}
        padding={{ top: 90, bottom: 340, left: 60, right: 60 }}
      />
      <div className="clock">{formatCaseTime(t, view.startMinute, clock)}</div>
      <div className={classNames('card', { good: finished && !escaped, bad: escaped && finished })}>
        {step === 'arrived' && !travel.correct && (
          <div className="local">
            <SpeechBubble className="bubble" text={t('detective.witness.nothingSeen')} typing tail="left" />
            <WitnessAvatar seed={local.seed} role={local.role} expression="surprised" size={96} />
          </div>
        )}
        <p className="message">
          {(step === 'flying' || finished) && (
            <span className="flag">
              {countryFlag((step === 'flying' || lostTrail ? chosen : destination).countryCode)}
            </span>
          )}
          {message}
        </p>
        {detail && <p className="detail">{detail}</p>}
        {step === 'arrived' && !travel.correct && !lostTrail && (
          <GameButton size="large" startIcon={<TravelExploreIcon />} onClick={() => setStep('redirecting')}>
            {t('detective.travel.follow')}
          </GameButton>
        )}
        {finished && (
          <GameButton
            size="large"
            color={escaped ? 'magenta' : caught ? 'lime' : 'gold'}
            startIcon={caught ? <EmojiEventsIcon /> : undefined}
            endIcon={caught || escaped ? undefined : <ArrowForwardIcon />}
            onClick={onContinue}
          >
            {caught || escaped ? t('detective.travel.seeSummary') : t('detective.travel.continue')}
          </GameButton>
        )}
      </div>
    </div>
  )
}
