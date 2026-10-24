import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'
import { DetectiveEvent, DetectiveEventType } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { countMistakes, getTravelMinutes } from '@/app/(protected)/(game)/utils/detective'
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
 * services/detectiveMode.ts). Those last ones (`flexible`) may still be
 * swapped for one of the other kind when the stage is reached, to even out the
 * case: more bad ones for a detective with time to spare, more good ones for
 * one running out of it (see rebalanceStageEvents). Everything about them is
 * tuned here.
 */

/** What an event changes: two events of the same stage never change the same thing. */
type EventGroup =
  | 'witnesses'
  | 'clues'
  | 'clueKinds'
  | 'traits'
  | 'suspects'
  | 'time'
  | 'options'
  | 'witnessCost'
  | 'calls'
  | 'mistakes'
  | 'flight'

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
  /**
   * Whether it only changes how the stage is played (not how it was planned):
   * it can be swapped for another one when the stage is reached (see rebalanceStageEvents).
   */
  flexible?: boolean
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
/** What a witness costs at a stage with `quickWitnesses` (times its usual cost). */
export const QUICK_WITNESSES_FACTOR = 0.5

/*
 * The variants of some events: when a case is planned, each one of them gets
 * a value of each of its lists, at random. The singular constants after each
 * list are what the event does in the cases created before the variants.
 */

/** `talkative`: how many witnesses of the stage tell two clues (null: all of them). */
export const TALKATIVE_VARIANTS: (number | null)[] = [1, 2, null]
/** `ruledOut`: how many wrong destinations it rules out (always leaving at least one). */
export const RULED_OUT_VARIANTS = [1, 2]
/** `slowWitnesses`: what a witness costs (times its usual cost). */
export const SLOW_WITNESSES_VARIANTS = [1.25, 1.5, 2]
export const SLOW_WITNESSES_FACTOR = 1.5
/** `hotline`: what a call costs (times its usual cost) and how many more wrong destinations it rules out. */
export const HOTLINE_FACTOR_VARIANTS = [0.25, 0.5, 0.75]
export const HOTLINE_ELIMINATED_VARIANTS = [0, 1, 2]
export const HOTLINE_CALL_FACTOR = 0.5
export const HOTLINE_EXTRA_ELIMINATED = 1
/** `badSignal`: what a call costs (times its usual cost) and how many fewer wrong destinations it rules out (always at least one). */
export const BAD_SIGNAL_FACTOR_VARIANTS = [1.25, 1.5, 2]
export const BAD_SIGNAL_ELIMINATED_VARIANTS = [0, 1]
export const BAD_SIGNAL_CALL_FACTOR = 1.5
export const BAD_SIGNAL_FEWER_ELIMINATED = 1
/** `directFlight` / `delayedFlight`: minutes it takes from (or adds to) the trip out of a stage. */
export const FLIGHT_EVENT_VARIANTS = [30, 60, 90, 120]
export const FLIGHT_EVENT_MINUTES = 90
/**
 * When the detective gets to a stage, each flexible event of it may be swapped
 * for one of the other kind (see rebalanceStageEvents): its good ones for bad
 * ones when the detective is ahead of time, its bad ones for good ones when it
 * is behind. The chance is how far ahead or behind it is (see getCasePace)
 * times `eventBalance` (of the difficulty), never more than this.
 */
export const MAX_REBALANCE_CHANCE = 0.6
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
  extraTime: { good: true, group: 'time', flexible: true },
  // At least one wrong destination stays: there is always a choice.
  ruledOut: { good: true, group: 'options', flexible: true, eligible: (state) => state.options >= 3 },
  quickWitnesses: { good: true, group: 'witnessCost', flexible: true },
  extraCall: { good: true, group: 'calls', flexible: true, apply: (state) => void state.calls++ },
  hotline: { good: true, group: 'calls', flexible: true, eligible: (state) => state.calls > 0 },
  secondChance: { good: true, group: 'mistakes', flexible: true, apply: (state) => void state.mistakes++ },
  directFlight: { good: true, group: 'flight', flexible: true },
  // With a single witness, knowing what it knows about changes nothing.
  witnessFiles: { good: true, group: 'clueKinds', flexible: true, eligible: (state) => state.witnesses >= 2 },
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
  lostTime: { good: false, group: 'time', flexible: true },
  moreRumors: {
    good: false,
    group: 'options',
    eligible: (state) => state.options < MAX_OPTIONS,
    apply: (state) => void state.options++
  },
  slowWitnesses: { good: false, group: 'witnessCost', flexible: true },
  linesDown: { good: false, group: 'calls', flexible: true, eligible: (state) => state.calls > 0 },
  badSignal: { good: false, group: 'calls', flexible: true, eligible: (state) => state.calls > 0 },
  pressure: {
    good: false,
    group: 'mistakes',
    flexible: true,
    eligible: (state) => state.mistakes > 0,
    apply: (state) => void state.mistakes--
  },
  delayedFlight: { good: false, group: 'flight', flexible: true }
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
      events.push(planEvent(type, state, random))
      definition.apply?.(state)
    }

    return events
  })

  return { stages, suspects: state.suspects }
}

/** An event with its variant (see the *_VARIANTS lists), for the stage being planned. */
function planEvent(type: DetectiveEventType, state: PlanState, random: RandomFn): DetectiveEvent {
  switch (type) {
    case 'extraTime':
    case 'lostTime':
      return { type, minutes: pickRandom(EVENT_TIME_HOURS, random)! * 60 }

    case 'directFlight':
    case 'delayedFlight':
      return { type, minutes: pickRandom(FLIGHT_EVENT_VARIANTS, random)! }

    case 'talkative': {
      // As many witnesses as there are (or more) is all of them.
      const witnesses = pickRandom(
        TALKATIVE_VARIANTS.filter((count) => count == null || count < state.witnesses),
        random
      )

      return witnesses == null ? { type } : { type, witnesses }
    }

    case 'ruledOut':
      // At least one wrong destination stays: there is always a choice.
      return {
        type,
        count: pickRandom(
          RULED_OUT_VARIANTS.filter((count) => count <= state.options - 2),
          random
        )!
      }

    case 'slowWitnesses':
      return { type, factor: pickRandom(SLOW_WITNESSES_VARIANTS, random)! }

    case 'hotline':
      return {
        type,
        factor: pickRandom(HOTLINE_FACTOR_VARIANTS, random)!,
        eliminatesChange: pickRandom(HOTLINE_ELIMINATED_VARIANTS, random)!
      }

    case 'badSignal':
      return {
        type,
        factor: pickRandom(BAD_SIGNAL_FACTOR_VARIANTS, random)!,
        eliminatesChange: 0 - pickRandom(BAD_SIGNAL_ELIMINATED_VARIANTS, random)!
      }

    default:
      return { type }
  }
}

/** The events of a stage (none in the cases created before they existed). */
export function getStageEvents(stage: DetectiveStage): DetectiveEvent[] {
  return stage.events ?? []
}

/** The event of a type of a stage, if it has one. */
export function getStageEvent(stage: DetectiveStage, type: DetectiveEventType): DetectiveEvent | undefined {
  return getStageEvents(stage).find((event) => event.type === type)
}

/** Whether a stage has an event. */
export function hasEvent(stage: DetectiveStage, type: DetectiveEventType): boolean {
  return getStageEvent(stage, type) !== undefined
}

/** The wrong destinations a `ruledOut` event ruled out. */
export function getRuledOutPlaceIds(event: DetectiveEvent): number[] {
  return event.placeIds ?? (event.placeId != null ? [event.placeId] : [])
}

/**
 * How the witnesses of a stage are planned: how many, how many clues the
 * talkative ones tell (and how many of them there are), how many traits of
 * the thief.
 */
export interface StageWitnessPlan {
  witnesses: number
  cluesPerWitness: number
  /** Witnesses that tell `cluesPerWitness` clues (the others, one). */
  talkativeWitnesses: number
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
  const talkative = events.find((event) => event.type === 'talkative')
  const witnesses = Math.min(
    MAX_WITNESSES,
    Math.max(MIN_WITNESSES, rules.witnesses + (has('extraWitness') ? 1 : 0) - (has('missingWitness') ? 1 : 0))
  )

  return {
    witnesses,
    cluesPerWitness: talkative ? 2 : 1,
    talkativeWitnesses: talkative ? Math.min(witnesses, talkative.witnesses ?? witnesses) : 0,
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
  const slow = getStageEvent(stage, 'slowWitnesses')

  if (hasEvent(stage, 'quickWitnesses')) {
    return scaleCost(rules.witnessMinutes, QUICK_WITNESSES_FACTOR)
  }

  if (slow) {
    return scaleCost(rules.witnessMinutes, slow.factor ?? SLOW_WITNESSES_FACTOR)
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
  const hotline = getStageEvent(stage, 'hotline')
  const badSignal = getStageEvent(stage, 'badSignal')

  if (hotline) {
    return {
      available: true,
      minutes: scaleCost(minutes, hotline.factor ?? HOTLINE_CALL_FACTOR),
      eliminates: Math.max(1, eliminates + (hotline.eliminatesChange ?? HOTLINE_EXTRA_ELIMINATED))
    }
  }

  if (badSignal) {
    return {
      available: true,
      minutes: scaleCost(minutes, badSignal.factor ?? BAD_SIGNAL_CALL_FACTOR),
      eliminates: Math.max(1, eliminates + (badSignal.eliminatesChange ?? -BAD_SIGNAL_FEWER_ELIMINATED))
    }
  }

  return { available: !hasEvent(stage, 'linesDown'), minutes, eliminates }
}

/** Minutes the events of a stage add to (or take from) the trip out of it. */
export function getStageFlightMinutes(stage: DetectiveStage): number {
  const delayed = getStageEvent(stage, 'delayedFlight')
  const direct = getStageEvent(stage, 'directFlight')

  return (
    (delayed ? (delayed.minutes ?? FLIGHT_EVENT_MINUTES) : 0) - (direct ? (direct.minutes ?? FLIGHT_EVENT_MINUTES) : 0)
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
 * rules out its destinations.
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
    } else if (event.type === 'ruledOut') {
      stage.eliminated = [...new Set([...(stage.eliminated ?? []), ...getRuledOutPlaceIds(event)])]
    }
  }
}

/**
 * How the detective is doing with the time when it gets to its current stage,
 * from -1 (out of time) to 1 (with all the time to spare): the margin of the
 * case (its time beyond the trips of the right route and the witnesses it
 * allows for, see computeTimeLimitMinutes) it has left, compared with what it
 * would have left spending it evenly along the route. 0 is right on pace.
 */
export function getCasePace(data: DetectiveGameData): number {
  const stops = [data.origin, ...data.stages.map((stage) => stage.destination)]
  const witnessMinutes = data.settings.witnesses * data.settings.witnessBudgetMinutes
  const stageMinutes = data.stages.map((_, index) => getTravelMinutes(stops[index], stops[index + 1]) + witnessMinutes)
  const total = stageMinutes.reduce((sum, minutes) => sum + minutes, 0)
  const remaining = stageMinutes.slice(data.currentStage - 1).reduce((sum, minutes) => sum + minutes, 0)
  const margin = data.timeLimitMinutes - total

  if (margin <= 0 || total <= 0) {
    return 0
  }

  const marginLeft = data.timeLimitMinutes - data.elapsedMinutes - remaining
  const expectedMarginLeft = (margin * remaining) / total

  return Math.min(1, Math.max(-1, (marginLeft - expectedMarginLeft) / margin))
}

/** How the case stands for an event of a stage being reached: its other events and those of the stages before. */
function getRevealState(data: DetectiveGameData, stage: DetectiveStage): PlanState {
  return {
    witnesses: stage.witnesses.length,
    options: stage.options.length - (stage.eliminated?.length ?? 0),
    suspects: getExpectedSuspects(data),
    mistakes: getAllowedMistakes(data) - countMistakes(data),
    calls: getCallsLeft(data)
  }
}

/**
 * Evens out a case as the detective gets to a stage (1-based), before its
 * events happen (see revealStage): with time to spare (see getCasePace), each
 * good flexible event of the stage may become a bad one; running out of it,
 * each bad one may become a good one (see MAX_REBALANCE_CHANCE). The new
 * event is any of the other kind that changes something else than the other
 * events of the stage and that would do something, with a variant of its own;
 * when there is none, the event stays.
 */
export function rebalanceStageEvents(
  data: DetectiveGameData,
  stageNumber: number,
  random: RandomFn = Math.random
): void {
  const stage = data.stages[stageNumber - 1]

  if (!stage?.events?.length) {
    return
  }

  const pace = getCasePace(data)
  const swapChance = Math.min(MAX_REBALANCE_CHANCE, Math.abs(pace) * (data.settings.eventBalance ?? 0))
  // Ahead of time, the good events may turn bad; behind, the bad ones good.
  const swapGood = pace > 0

  if (swapChance <= 0) {
    return
  }

  stage.events.forEach((event, index) => {
    const definition = DETECTIVE_EVENTS[event.type]

    if (!definition.flexible || definition.good !== swapGood || !chance(swapChance, random)) {
      return
    }

    const events = stage.events!
    const others = events.filter((_, other) => other !== index)
    const groups = new Set(others.map((other) => DETECTIVE_EVENTS[other.type].group))

    // The case as it would be without this event.
    stage.events = others

    const state = getRevealState(data, stage)
    const type = pickRandom(
      DETECTIVE_EVENT_TYPES.filter((candidate) => {
        const candidateDefinition = DETECTIVE_EVENTS[candidate]

        return (
          candidateDefinition.flexible &&
          candidateDefinition.good !== swapGood &&
          !groups.has(candidateDefinition.group) &&
          (candidateDefinition.eligible?.(state) ?? true)
        )
      }),
      random
    )

    stage.events = events

    if (type) {
      events[index] = planRevealedEvent(type, stage, state, random)
    }
  })
}

/** An event planned when its stage is reached: `ruledOut` picks its wrong destinations right there. */
function planRevealedEvent(
  type: DetectiveEventType,
  stage: DetectiveStage,
  state: PlanState,
  random: RandomFn
): DetectiveEvent {
  const event = planEvent(type, state, random)

  if (event.type === 'ruledOut') {
    const decoys = stage.options.filter(
      (option) => option.placeId !== stage.destination.placeId && !stage.eliminated?.includes(option.placeId)
    )

    event.placeIds = shuffle(decoys, random)
      .slice(0, event.count)
      .map((decoy) => decoy.placeId)
  }

  return event
}
