import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'
import { DetectiveEvent, DetectiveEventType } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { CLUES_PER_LANDMARK } from '@/app/(protected)/(game)/utils/landmarkClues'
import { pickRandom, shuffle } from '@/app/(protected)/(game)/utils/random'
import { chance } from '@/app/(protected)/(game)/utils/seededRandom'

/**
 * Random events of the detective mode. When a case is planned, some of its
 * stages get one event (or two) — how often is set by the difficulty
 * (`eventChance`, `doubleEventChance`) — and there are always as many good ones
 * as bad ones (one more of either when they are odd). They are revealed when
 * the detective gets to their stage. Some change how the stage is planned
 * (witnesses, clues, destinations, suspects: see services/detectiveCases.ts),
 * others how it is played (time, costs, calls, mistakes: see
 * services/detectiveMode.ts). Everything about them is tuned here.
 */

/** What an event changes: two events of the same stage never change the same thing. */
type EventGroup =
  'witnesses' | 'clues' | 'traits' | 'suspects' | 'time' | 'options' | 'witnessCost' | 'calls' | 'mistakes' | 'flight'

/** How the case stands while its events are planned (to never plan an event that would do nothing, or too much). */
interface PlanState {
  /** Witnesses of the stage being planned. */
  witnesses: number
  /** Destinations of the stage being planned. */
  options: number
  /** Suspects at the end. */
  suspects: number
  /** Wrong destinations allowed. */
  mistakes: number
  /** Calls to the central office available. */
  calls: number
}

interface EventDefinition {
  good: boolean
  group: EventGroup
  /** Whether it can happen (default: always). */
  eligible?: (state: PlanState) => boolean
  /** How it changes the state of the plan. */
  apply?: (state: PlanState) => void
}

/** Fewest and most witnesses of a stage (each one needs a clue of its own). */
export const MIN_WITNESSES = 1
export const MAX_WITNESSES = CLUES_PER_LANDMARK
/** Fewest and most suspects at the end. */
export const MIN_SUSPECTS = 2
export const MAX_SUSPECTS = 6
/** Most destinations offered at a stage (letters A to G). */
export const MAX_OPTIONS = 7
/** Hours `extraTime` / `lostTime` may add or take (one of them, at random). */
export const EVENT_TIME_HOURS = [2, 3, 4]
/** `lostTime` never leaves less than this many minutes: an event never ends a case by itself. */
export const MIN_TIME_LEFT_AFTER_EVENT = 60
/** What a witness costs at a stage with `quickWitnesses` / `slowWitnesses` (times its usual cost). */
export const QUICK_WITNESSES_FACTOR = 0.5
export const SLOW_WITNESSES_FACTOR = 1.5
/** What a call costs from a stage with `hotline` / `badSignal` (times its usual cost)… */
export const HOTLINE_CALL_FACTOR = 0.5
export const BAD_SIGNAL_CALL_FACTOR = 1.5
/** …and how many more (or fewer) wrong destinations it rules out (always at least one). */
export const HOTLINE_EXTRA_ELIMINATED = 1
export const BAD_SIGNAL_FEWER_ELIMINATED = 1
/** Minutes `directFlight` takes from (and `delayedFlight` adds to) the trip out of a stage. */
export const FLIGHT_EVENT_MINUTES = 90
/** Every cost changed by an event is rounded to this many minutes (and is never less). */
const COST_ROUNDING_MINUTES = 30

export const DETECTIVE_EVENTS: Record<DetectiveEventType, EventDefinition> = {
  // ---- good ----
  extraWitness: {
    good: true,
    group: 'witnesses',
    eligible: (state) => state.witnesses < MAX_WITNESSES,
    apply: (state) => void state.witnesses++
  },
  talkative: { good: true, group: 'clues' },
  sharpEye: { good: true, group: 'traits', eligible: (state) => state.witnesses >= 2 },
  suspectCleared: {
    good: true,
    group: 'suspects',
    eligible: (state) => state.suspects > MIN_SUSPECTS,
    apply: (state) => void state.suspects--
  },
  extraTime: { good: true, group: 'time' },
  // At least one wrong destination stays: there is always a choice.
  ruledOut: { good: true, group: 'options', eligible: (state) => state.options >= 3 },
  quickWitnesses: { good: true, group: 'witnessCost' },
  extraCall: { good: true, group: 'calls', apply: (state) => void state.calls++ },
  hotline: { good: true, group: 'calls', eligible: (state) => state.calls > 0 },
  secondChance: { good: true, group: 'mistakes', apply: (state) => void state.mistakes++ },
  directFlight: { good: true, group: 'flight' },
  // ---- bad ----
  missingWitness: {
    good: false,
    group: 'witnesses',
    eligible: (state) => state.witnesses > MIN_WITNESSES,
    apply: (state) => void state.witnesses--
  },
  noSighting: { good: false, group: 'traits' },
  accomplice: {
    good: false,
    group: 'suspects',
    eligible: (state) => state.suspects < MAX_SUSPECTS,
    apply: (state) => void state.suspects++
  },
  lostTime: { good: false, group: 'time' },
  moreRumors: {
    good: false,
    group: 'options',
    eligible: (state) => state.options < MAX_OPTIONS,
    apply: (state) => void state.options++
  },
  slowWitnesses: { good: false, group: 'witnessCost' },
  linesDown: { good: false, group: 'calls', eligible: (state) => state.calls > 0 },
  badSignal: { good: false, group: 'calls', eligible: (state) => state.calls > 0 },
  pressure: {
    good: false,
    group: 'mistakes',
    eligible: (state) => state.mistakes > 0,
    apply: (state) => void state.mistakes--
  },
  delayedFlight: { good: false, group: 'flight' }
}

export const DETECTIVE_EVENT_TYPES = Object.keys(DETECTIVE_EVENTS) as DetectiveEventType[]

/** Whether an event helps the detective. */
export function isGoodEvent(type: DetectiveEventType): boolean {
  return DETECTIVE_EVENTS[type].good
}

/** The events of a case: those of every stage and, after all of them, the suspects there will be at the end. */
export interface PlannedEvents {
  stages: DetectiveEvent[][]
  suspects: number
}

type EventRules = Pick<
  DetectiveDifficultySettings,
  'witnesses' | 'options' | 'suspects' | 'maxMistakes' | 'centralCalls' | 'eventChance' | 'doubleEventChance'
>

/**
 * Plans the events of the `hops` stages of a case: how many each stage gets
 * (none, one or two, see `eventChance` and `doubleEventChance`), as many good
 * as bad ones overall, shuffled, and which ones: never two that change the same
 * thing in a stage, nor one that would do nothing (another call when there are
 * no calls, one suspect less when there are only two...).
 */
export function planCaseEvents(rules: EventRules, hops: number, random: RandomFn = Math.random): PlannedEvents {
  const counts = Array.from({ length: hops }, (): number =>
    chance(rules.eventChance ?? 0, random) ? (chance(rules.doubleEventChance ?? 0, random) ? 2 : 1) : 0
  )
  const total = counts.reduce((sum, count) => sum + count, 0)
  const half = Math.floor(total / 2)
  // As many good events as bad ones: the odd one out, either.
  const deck = shuffle(
    [
      ...Array<boolean>(half).fill(true),
      ...Array<boolean>(half).fill(false),
      ...(total % 2 === 1 ? [chance(0.5, random)] : [])
    ],
    random
  )
  const state: PlanState = {
    witnesses: rules.witnesses,
    options: rules.options,
    suspects: rules.suspects,
    mistakes: rules.maxMistakes,
    calls: rules.centralCalls ?? 0
  }
  const stages = counts.map((count) => {
    const groups = new Set<EventGroup>()
    const events: DetectiveEvent[] = []

    state.witnesses = rules.witnesses
    state.options = rules.options

    for (let index = 0; index < count; index++) {
      const good = deck.pop()!
      const type = pickRandom(
        DETECTIVE_EVENT_TYPES.filter((candidate) => {
          const definition = DETECTIVE_EVENTS[candidate]

          return definition.good === good && !groups.has(definition.group) && (definition.eligible?.(state) ?? true)
        }),
        random
      )

      if (!type) {
        continue
      }

      const definition = DETECTIVE_EVENTS[type]

      groups.add(definition.group)
      definition.apply?.(state)
      events.push(
        type === 'extraTime' || type === 'lostTime'
          ? { type, minutes: pickRandom(EVENT_TIME_HOURS, random)! * 60 }
          : { type }
      )
    }

    return events
  })

  return { stages, suspects: state.suspects }
}

/** The events of a stage (none in the cases created before they existed). */
export function getStageEvents(stage: DetectiveStage): DetectiveEvent[] {
  return stage.events ?? []
}

/** Whether a stage has an event. */
export function hasEvent(stage: DetectiveStage, type: DetectiveEventType): boolean {
  return getStageEvents(stage).some((event) => event.type === type)
}

/** How the witnesses of a stage are planned: how many, how many clues each, how many traits of the thief. */
export interface StageWitnessPlan {
  witnesses: number
  cluesPerWitness: number
  suspectClues: number
  /** Wrong destinations offered. */
  decoys: number
}

/** The witnesses and destinations of a stage, with its events. */
export function getStagePlan(
  rules: Pick<DetectiveDifficultySettings, 'witnesses' | 'options'>,
  events: DetectiveEvent[]
): StageWitnessPlan {
  const has = (type: DetectiveEventType) => events.some((event) => event.type === type)
  const witnesses = Math.min(
    MAX_WITNESSES,
    Math.max(MIN_WITNESSES, rules.witnesses + (has('extraWitness') ? 1 : 0) - (has('missingWitness') ? 1 : 0))
  )

  return {
    witnesses,
    cluesPerWitness: has('talkative') ? 2 : 1,
    suspectClues: Math.min(witnesses, has('sharpEye') ? 2 : has('noSighting') ? 0 : 1),
    decoys: Math.min(MAX_OPTIONS, rules.options + (has('moreRumors') ? 1 : 0)) - 1
  }
}

/** A cost changed by an event: rounded, and never less than the rounding. */
function scaleCost(minutes: number, factor: number): number {
  return Math.max(COST_ROUNDING_MINUTES, Math.round((minutes * factor) / COST_ROUNDING_MINUTES) * COST_ROUNDING_MINUTES)
}

/** Minutes each witness of a stage costs. */
export function getStageWitnessMinutes(
  rules: Pick<DetectiveDifficultySettings, 'witnessMinutes'>,
  stage: DetectiveStage
): number {
  if (hasEvent(stage, 'quickWitnesses')) {
    return scaleCost(rules.witnessMinutes, QUICK_WITNESSES_FACTOR)
  }

  if (hasEvent(stage, 'slowWitnesses')) {
    return scaleCost(rules.witnessMinutes, SLOW_WITNESSES_FACTOR)
  }

  return rules.witnessMinutes
}

/** A call to the central office from a stage: whether it can be made, what it costs and how many destinations it rules out. */
export interface StageCallRules {
  available: boolean
  minutes: number
  eliminates: number
}

export function getStageCallRules(
  rules: Partial<Pick<DetectiveDifficultySettings, 'centralCallMinutes' | 'centralCallEliminates'>>,
  stage: DetectiveStage
): StageCallRules {
  const minutes = rules.centralCallMinutes ?? 0
  const eliminates = rules.centralCallEliminates ?? 0

  if (hasEvent(stage, 'hotline')) {
    return {
      available: true,
      minutes: scaleCost(minutes, HOTLINE_CALL_FACTOR),
      eliminates: eliminates + HOTLINE_EXTRA_ELIMINATED
    }
  }

  if (hasEvent(stage, 'badSignal')) {
    return {
      available: true,
      minutes: scaleCost(minutes, BAD_SIGNAL_CALL_FACTOR),
      eliminates: Math.max(1, eliminates - BAD_SIGNAL_FEWER_ELIMINATED)
    }
  }

  return { available: !hasEvent(stage, 'linesDown'), minutes, eliminates }
}

/** Minutes the events of a stage add to (or take from) the trip out of it. */
export function getStageFlightMinutes(stage: DetectiveStage): number {
  return (
    (hasEvent(stage, 'delayedFlight') ? FLIGHT_EVENT_MINUTES : 0) -
    (hasEvent(stage, 'directFlight') ? FLIGHT_EVENT_MINUTES : 0)
  )
}

/** A trip out of a stage, with its events (never less than COST_ROUNDING_MINUTES). */
export function applyFlightEvents(minutes: number, stage: DetectiveStage): number {
  return Math.max(COST_ROUNDING_MINUTES, minutes + getStageFlightMinutes(stage))
}

/** The stages the detective already got to (their events are known). */
export function getReachedStages(data: DetectiveGameData): DetectiveStage[] {
  return data.stages.slice(0, Math.min(data.currentStage, data.stages.length))
}

function countReachedEvents(data: DetectiveGameData, type: DetectiveEventType): number {
  return getReachedStages(data).filter((stage) => hasEvent(stage, type)).length
}

/** Wrong destinations allowed so far: the difficulty's, changed by the events already revealed. */
export function getAllowedMistakes(data: DetectiveGameData): number {
  return Math.max(
    0,
    data.settings.maxMistakes + countReachedEvents(data, 'secondChance') - countReachedEvents(data, 'pressure')
  )
}

/** Calls to the central office left. */
export function getCallsLeft(data: DetectiveGameData): number {
  const made = data.stages.reduce((total, stage) => total + (stage.calls ?? 0), 0)

  return Math.max(0, (data.settings.centralCalls ?? 0) + countReachedEvents(data, 'extraCall') - made)
}

/** Suspects the detective expects at the end, with the events revealed so far. */
export function getExpectedSuspects(data: DetectiveGameData): number {
  return Math.min(
    MAX_SUSPECTS,
    Math.max(
      MIN_SUSPECTS,
      data.settings.suspects + countReachedEvents(data, 'accomplice') - countReachedEvents(data, 'suspectCleared')
    )
  )
}

/**
 * What happens as soon as the detective gets to a stage (1-based): its time
 * events change the time of the case (`lostTime` takes at most what leaves
 * MIN_TIME_LEFT_AFTER_EVENT, and keeps what it really took) and `ruledOut`
 * rules out its destination.
 */
export function revealStage(data: DetectiveGameData, stageNumber: number): void {
  const stage = data.stages[stageNumber - 1]

  if (!stage) {
    return
  }

  for (const event of getStageEvents(stage)) {
    if (event.type === 'extraTime') {
      data.timeLimitMinutes += event.minutes ?? 0
    } else if (event.type === 'lostTime') {
      const left = data.timeLimitMinutes - data.elapsedMinutes
      const room = Math.max(
        0,
        Math.floor((left - MIN_TIME_LEFT_AFTER_EVENT) / COST_ROUNDING_MINUTES) * COST_ROUNDING_MINUTES
      )

      event.minutes = Math.min(event.minutes ?? 0, room)
      data.timeLimitMinutes -= event.minutes
    } else if (event.type === 'ruledOut' && event.placeId != null) {
      stage.eliminated = [...new Set([...(stage.eliminated ?? []), event.placeId])]
    }
  }
}
