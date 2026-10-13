'use client'

import './index.scss'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import classNames from 'classnames'
import { useMemo } from 'react'
import DetectiveMap, { DetectiveMapLeg, DetectiveMapMarker } from '@/app/(protected)/(game)/components/DetectiveMap'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { useGameStore } from '@/app/(protected)/(game)/stores/game'
import { formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { countryFlag } from '@/app/(protected)/(game)/utils/places'
import { SUSPECT_ROLE } from '@/app/(protected)/(game)/utils/suspects'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { useI18n } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

/** Page where the difficulty of a new case is chosen. */
const NEW_CASE_PATH = '/play/detective'

/**
 * End of a detective case: caught or escaped, the route of the
 * thief on the map (with the detective's wrong trips) and every destination
 * with how the detective got there.
 */
export default function DetectiveGameSummary() {
  const { t } = useI18n()
  const game = useGameStore((state) => state.game)!
  const view = game.modeView as DetectiveGameView
  const caught = view.outcome === 'caught'
  // Title and story of the outcome: caught, escaped (time), lost trail (mistakes) or wrong suspect.
  const ending = caught
    ? 'caught'
    : view.outcome === 'lostTrail' || view.outcome === 'wrongSuspect'
      ? view.outcome
      : 'escaped'
  const thief = view.lineup && view.lineup.thief !== null ? view.lineup.suspects[view.lineup.thief] : null
  const loot = t(`detective.loot.loot${view.loot + 1}` as MessageKey)
  const route = useMemo(() => view.route ?? [], [view.route])
  const mistakes = view.playedStages.filter((stage) => !stage.travel.correct).length
  const witnesses = view.playedStages.reduce((total, stage) => total + stage.askedWitnesses, 0)
  const markers = useMemo<DetectiveMapMarker[]>(
    () => [
      ...route.map((stop, index) => ({
        id: `stop-${index}`,
        position: stop,
        label: index === 0 ? '★' : String(index),
        variant: 'target' as const,
        color: index === 0 ? '#22d3ee' : undefined
      })),
      ...view.playedStages
        .filter((stage) => !stage.travel.correct)
        .map((stage) => ({
          id: `wrong-${stage.stageNumber}`,
          position: stage.chosen,
          label: '✗',
          variant: 'guess' as const
        }))
    ],
    [route, view.playedStages]
  )
  const legs = useMemo<DetectiveMapLeg[]>(
    () => [
      ...route.slice(1).map((stop, index) => ({ from: route[index], to: stop, kind: 'route' as const })),
      ...view.playedStages
        .filter((stage) => !stage.travel.correct)
        .map((stage) => ({ from: stage.from, to: stage.chosen, kind: 'wrong' as const }))
    ],
    [route, view.playedStages]
  )

  return (
    <div className="detective-game-summary">
      <GamePanel
        className={classNames('hero', { caught })}
        title={`${t('detective.briefing.case')} - ${t(`detective.difficulty.${view.difficulty}.name` as MessageKey)}`}
        accent={caught ? 'lime' : 'magenta'}
      >
        <h1 className="outcome">{t(`detective.summary.${ending}`)}</h1>
        <p className="story">{t(`detective.summary.${ending}Text`, { loot })}</p>
        {thief !== null && (
          <div className="thief">
            <WitnessAvatar
              seed={thief}
              role={SUSPECT_ROLE}
              suspect
              expression={caught ? 'neutral' : 'smile'}
              size={96}
            />
            <span className="caption">{t('detective.summary.thiefWas')}</span>
          </div>
        )}
        <dl className="stats">
          <div>
            <dt>{t('detective.summary.timeUsed')}</dt>
            <dd>
              {formatDuration(Math.min(view.elapsedMinutes, view.timeLimitMinutes))} /{' '}
              {formatDuration(view.timeLimitMinutes)}
            </dd>
          </div>
          <div>
            <dt>{t('detective.summary.witnesses')}</dt>
            <dd>{witnesses}</dd>
          </div>
          <div>
            <dt>{t('detective.summary.mistakes')}</dt>
            <dd>{mistakes}</dd>
          </div>
        </dl>
        <div className="actions">
          <GameButton size="large" startIcon={<TravelExploreIcon />} href={NEW_CASE_PATH}>
            {t('detective.intro.newCase')}
          </GameButton>
          <GameButton color="ghost" size="large" startIcon={<HomeIcon />} href="/play">
            {t('common.menu')}
          </GameButton>
        </div>
      </GamePanel>
      <div className="details">
        <GamePanel className="map-panel" title={t('detective.summary.route')} accent="cyan">
          <DetectiveMap className="summary-map" markers={markers} legs={legs} fitTo={route} />
        </GamePanel>
        <GamePanel className="stages-panel" title={t('detective.summary.stages')} accent="gold">
          <ol className="stages">
            {route.slice(1).map((stop, index) => {
              const played = view.playedStages.find((stage) => stage.stageNumber === index + 1)

              return (
                <li key={stop.placeId} className={classNames('stage', { missed: !played })}>
                  <span className="number">{index + 1}</span>
                  <div className="info">
                    <span className="place">
                      {countryFlag(stop.countryCode)} {stop.placeName}
                    </span>
                    <span className="how">
                      {!played
                        ? t('detective.summary.notReached')
                        : played.travel.correct
                          ? t('detective.summary.right', { time: formatDuration(played.travel.travelMinutes) })
                          : t('detective.summary.wrongTo', {
                              place: played.chosen.placeName,
                              time: formatDuration(played.travel.travelMinutes + played.travel.redirectMinutes)
                            })}
                    </span>
                    {played && played.events.length > 0 && (
                      <span className="events">
                        {played.events.map((event) => (
                          <span key={event.type} className={classNames('event', event.good ? 'good' : 'bad')}>
                            {t(`detective.events.${event.type}.title` as MessageKey)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <span className="icon">
                    {!played ? (
                      <HourglassEmptyIcon className="missed" />
                    ) : played.travel.correct ? (
                      <CheckCircleIcon className="right" />
                    ) : (
                      <WarningAmberIcon className="wrong" />
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        </GamePanel>
      </div>
    </div>
  )
}
