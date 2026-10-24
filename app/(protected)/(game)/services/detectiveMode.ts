import { AccuseAction } from '@/app/(protected)/(game)/models/AccuseAction'
import { AskWitnessAction } from '@/app/(protected)/(game)/models/AskWitnessAction'
import { CallCentralAction } from '@/app/(protected)/(game)/models/CallCentralAction'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import {
  DetectiveCurrentStageView,
  DetectiveEventView,
  DetectiveGameView,
  DetectiveLineupView,
  DetectivePlayedStageView
} from '@/app/(protected)/(game)/models/DetectiveGameView'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameMembers } from '@/app/(protected)/(game)/models/GameMembers'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeDefinition } from '@/app/(protected)/(game)/models/GameModeDefinition'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { GameSummary } from '@/app/(protected)/(game)/models/GameSummary'
import { TravelAction } from '@/app/(protected)/(game)/models/TravelAction'
import { planDetectiveCase } from '@/app/(protected)/(game)/services/detectiveCases'
import { getMapPlaces } from '@/app/(protected)/(game)/services/maps'
import {
  countMistakes,
  getRedirectMinutes,
  getTravelMinutes,
  LOOT_COUNT,
  randomCaseStartMinute
} from '@/app/(protected)/(game)/utils/detective'
import {
  DEFAULT_DETECTIVE_DIFFICULTY,
  getDetectiveGameSettings
} from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import {
  applyFlightEvents,
  getAllowedMistakes,
  getCallsLeft,
  getExpectedSuspects,
  getRuledOutPlaceIds,
  getStageCallRules,
  getStageEvents,
  getStageFlightMinutes,
  getStageWitnessMinutes,
  isGoodEvent,
  rebalanceStageEvents,
  revealStage
} from '@/app/(protected)/(game)/utils/detectiveEvents'
import { getLandmarkClue } from '@/app/(protected)/(game)/utils/landmarkClues'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { ApiException } from '@/app/models/ApiException'

/** The only map of the mode: its landmarks have the clues the witnesses give. */
export const DETECTIVE_MAP_SLUG = 'landmarks'

const definition: GameModeDefinition<DetectiveGameSettings> = {
  mode: GameMode.DETECTIVE,
  slug: 'detective',
  name: 'Detective',
  description:
    'Seguí el rastro de un ladrón por lugares icónicos del mundo: hablá con testigos, elegí a dónde viajar y, al final, señalá al ladrón entre los sospechosos antes de que se acabe el tiempo.',
  image: '/modes/detective.png',
  minPlayers: 1,
  maxPlayers: 1,
  realtime: false,
  mapSlug: DETECTIVE_MAP_SLUG,
  // The rules of each difficulty are in utils/detectiveDifficulty.ts; the time available comes from the route of each case.
  settings: getDetectiveGameSettings(DEFAULT_DETECTIVE_DIFFICULTY),
  configurable: { difficulty: ['easy', 'medium', 'hard'] },
  // Left unfinished for a day: deleted (like the classic games).
  abandonAfterMs: 24 * 60 * 60 * 1000,
  abandonAction: 'delete'
}

function isFinished(data: DetectiveGameData): boolean {
  return data.outcome !== null
}

/** Whether the detective already got to the last stop and has to point at the thief among the suspects. */
function isIdentifying(data: DetectiveGameData): boolean {
  return !isFinished(data) && data.currentStage > data.stages.length
}

function getCurrentStage(data: DetectiveGameData, stageNumber: unknown): DetectiveStage {
  if (Number(stageNumber) !== data.currentStage || isIdentifying(data)) {
    throw new ApiException('errors.roundAlreadyPlayed')
  }

  return data.stages[data.currentStage - 1]
}

/** Stop where the detective is at a stage (1-based): the crime scene, or the destination of the previous stage. */
function getStageStop(data: DetectiveGameData, stageNumber: number): DetectiveStop {
  return stageNumber <= 1 ? data.origin : data.stages[stageNumber - 2].destination
}

/** Where the detective is at a stage (1-based). */
function getStageLocation(data: DetectiveGameData, stageNumber: number): DetectivePlace {
  return toPlace(getStageStop(data, stageNumber))
}

function toPlace({ placeId, placeName, countryCode, latitude, longitude }: DetectivePlace): DetectivePlace {
  return { placeId, placeName, countryCode, latitude, longitude }
}

/** Spends fictional time: once it runs out, the suspect escapes (true when it did). */
function spend(data: DetectiveGameData, minutes: number): boolean {
  data.elapsedMinutes += minutes

  if (data.elapsedMinutes > data.timeLimitMinutes) {
    data.outcome = 'escaped'

    return true
  }

  return false
}

/**
 * Talks to a witness of the current stage: it costs `witnessMinutes` (or what
 * the events of the stage say) the first time; asking again is free. Only
 * while there is time for it: witnesses never end a case, the time runs out
 * (if it does) on the next trip.
 */
function askWitness(data: DetectiveGameData, action: AskWitnessAction): boolean {
  const stage = getCurrentStage(data, action.stageNumber)
  const witness = Number(action.witness)

  if (!Number.isInteger(witness) || witness < 0 || witness >= stage.witnesses.length) {
    throw new ApiException('errors.invalidAction')
  }

  if (stage.askedWitnesses.includes(witness)) {
    return false
  }

  const minutes = getStageWitnessMinutes(data.settings, stage)

  if (data.timeLimitMinutes - data.elapsedMinutes < minutes) {
    throw new ApiException('errors.noTimeForWitness')
  }

  stage.askedWitnesses.push(witness)
  spend(data, minutes)

  return true
}

/**
 * Calls the central office from the current stage: it costs time (what the
 * difficulty and the events of the stage say) and rules out some wrong
 * destinations, at random — never all of them, there is always a choice. Only
 * with calls left, the lines up, something to rule out and time for it (like a
 * witness, a call never ends a case).
 */
function callCentral(data: DetectiveGameData, action: CallCentralAction, ctx: GameContext): boolean {
  const stage = getCurrentStage(data, action.stageNumber)
  const rules = getStageCallRules(data.settings, stage)
  const eliminated = stage.eliminated ?? []
  const decoys = stage.options.filter(
    (option) => option.placeId !== stage.destination.placeId && !eliminated.includes(option.placeId)
  )
  const count = Math.min(rules.eliminates, decoys.length - 1)

  if (getCallsLeft(data) <= 0) {
    throw new ApiException('errors.noCallsLeft')
  }

  if (!rules.available) {
    throw new ApiException('errors.centralLinesDown')
  }

  if (count <= 0) {
    throw new ApiException('errors.nothingToRuleOut')
  }

  if (data.timeLimitMinutes - data.elapsedMinutes < rules.minutes) {
    throw new ApiException('errors.noTimeForCall')
  }

  stage.eliminated = [
    ...eliminated,
    ...shuffle(decoys, ctx.random)
      .slice(0, count)
      .map((option) => option.placeId)
  ]
  stage.calls = (stage.calls ?? 0) + 1
  spend(data, rules.minutes)

  return true
}

/**
 * Travels to one of the destinations of the current stage. Right: the
 * detective arrives where the suspect was. Wrong: the trip there is wasted and
 * the detective still has to travel to the right one — unless it is one
 * mistake too many (`maxMistakes`, changed by the events): then the trail is
 * lost there. Ruled out destinations can not be chosen. Otherwise the
 * case goes on to the next stage — or, at the last stop, to the suspects (see
 * accuse) — or ends: escaped when the time runs out.
 */
function travel(data: DetectiveGameData, action: TravelAction, ctx: GameContext): boolean {
  const stage = getCurrentStage(data, action.stageNumber)
  const chosen = stage.options.find((option) => option.placeId === Number(action.placeId))

  if (!chosen || stage.eliminated?.includes(chosen.placeId)) {
    throw new ApiException('errors.invalidAction')
  }

  const from = getStageLocation(data, data.currentStage)
  const correct = chosen.placeId === stage.destination.placeId
  const travelMinutes = applyFlightEvents(getTravelMinutes(from, chosen), stage)
  const lostTrail = !correct && countMistakes(data) >= getAllowedMistakes(data)
  const redirectMinutes =
    correct || lostTrail ? 0 : getRedirectMinutes(from, chosen, stage.destination, data.settings.witnessMinutes)

  stage.travel = { placeId: chosen.placeId, correct, travelMinutes, redirectMinutes }

  if (lostTrail) {
    data.elapsedMinutes += travelMinutes
    data.outcome = 'lostTrail'

    return true
  }

  if (spend(data, travelMinutes + redirectMinutes)) {
    return true
  }

  data.currentStage++
  // Getting to the next stage: its events happen (evened out first with how the detective is doing with the time).
  rebalanceStageEvents(data, data.currentStage, ctx.random)
  revealStage(data, data.currentStage)

  // Cases created before the suspects existed end as soon as the detective gets to the last stop.
  if (data.currentStage > data.stages.length && !data.lineup) {
    data.outcome = 'caught'
  }

  return true
}

/**
 * Points at the thief among the suspects of the last stop: the case ends
 * either way — caught if it was the one, escaped if it was somebody else.
 */
function accuse(data: DetectiveGameData, action: AccuseAction): boolean {
  const lineup = data.lineup
  const suspect = Number(action.suspect)

  if (!lineup || !isIdentifying(data) || !Number.isInteger(suspect) || suspect < 0 || suspect >= lineup.seeds.length) {
    throw new ApiException('errors.invalidAction')
  }

  lineup.accused = suspect
  data.outcome = suspect === lineup.thief ? 'caught' : 'wrongSuspect'

  return true
}

function toEventViews(stage: DetectiveStage): DetectiveEventView[] {
  return getStageEvents(stage).map((event) => {
    const placeIds = event.type === 'ruledOut' ? getRuledOutPlaceIds(event) : []

    return {
      type: event.type,
      good: isGoodEvent(event.type),
      ...(event.minutes != null ? { minutes: event.minutes } : {}),
      ...(event.witnesses != null ? { witnesses: event.witnesses } : {}),
      ...(placeIds.length > 0 ? { placeIds } : {})
    }
  })
}

function toCurrentStageView(data: DetectiveGameData): DetectiveCurrentStageView | null {
  if (isFinished(data) || isIdentifying(data)) {
    return null
  }

  const stage = data.stages[data.currentStage - 1]

  return {
    stageNumber: data.currentStage,
    location: getStageLocation(data, data.currentStage),
    panoId: getStageStop(data, data.currentStage).panoId,
    witnesses: stage.witnesses.map((witness, index) => {
      const asked = stage.askedWitnesses.includes(index)

      return {
        seed: witness.seed,
        role: witness.role,
        asked,
        clues: asked
          ? [witness.clueIndex, ...(witness.extraClueIndices ?? [])].flatMap((index) => {
              const clue = getLandmarkClue(stage.destination.placeName, index)

              return clue ? [clue] : []
            })
          : [],
        suspectClue: asked ? (witness.suspectClue ?? null) : null
      }
    }),
    witnessMinutes: getStageWitnessMinutes(data.settings, stage),
    options: stage.options.map(toPlace),
    eliminated: [...(stage.eliminated ?? [])],
    flightMinutes: getStageFlightMinutes(stage),
    events: toEventViews(stage),
    call: { left: getCallsLeft(data), ...getStageCallRules(data.settings, stage) }
  }
}

/** The suspects once the detective is at the last stop (who the thief was only once it pointed at one). */
function toLineupView(data: DetectiveGameData): DetectiveLineupView | null {
  const lineup = data.lineup

  if (!lineup || (!isIdentifying(data) && lineup.accused === null)) {
    return null
  }

  const stop = data.stages[data.stages.length - 1].destination
  const closed = lineup.accused !== null

  return {
    location: toPlace(stop),
    panoId: stop.panoId,
    suspects: [...lineup.seeds],
    thief: closed ? lineup.thief : null,
    accused: lineup.accused
  }
}

function toPlayedStagesView(data: DetectiveGameData): DetectivePlayedStageView[] {
  return data.stages.flatMap((stage, index) => {
    if (!stage.travel) {
      return []
    }

    const chosen = stage.options.find((option) => option.placeId === stage.travel!.placeId)!

    return [
      {
        stageNumber: index + 1,
        from: getStageLocation(data, index + 1),
        destination: toPlace(stage.destination),
        chosen: toPlace(chosen),
        travel: { ...stage.travel },
        askedWitnesses: stage.askedWitnesses.length,
        calls: stage.calls ?? 0,
        events: toEventViews(stage)
      }
    ]
  })
}

/**
 * Detective mode: a single player follows a suspect through a route of
 * landmarks (`landmarks`). At every stage the player explores where the
 * detective is (Street View of the current stop) — the suspect already left,
 * so only the witnesses there give clues about the next stop and, one of them
 * in each stage, a trait of the thief — and travels to one of the destinations
 * offered, all against a fictional clock computed from the route (see
 * utils/detective.ts). At the last stop the detective has to point at the thief
 * among a few suspects, with the traits remembered.
 */
export const detectiveMode: GameModeEngine<DetectiveGameData, DetectiveGameSettings, DetectiveGameView> = {
  definition,

  async create(mapId, settings, ctx) {
    if (mapId == null) {
      throw new ApiException('errors.mapNotFound', 404)
    }

    // The rules of the difficulty chosen, kept in the case.
    const rules = getDetectiveGameSettings(settings.difficulty)
    const plan = await planDetectiveCase(await getMapPlaces(mapId), rules, ctx.finder, ctx.random)
    const data: DetectiveGameData = {
      v: 1,
      settings: rules,
      loot: Math.floor(ctx.random() * LOOT_COUNT),
      origin: plan.origin,
      stages: plan.stages,
      lineup: plan.lineup,
      currentStage: 1,
      startMinute: randomCaseStartMinute(ctx.random),
      elapsedMinutes: 0,
      timeLimitMinutes: plan.timeLimitMinutes,
      outcome: null
    }

    // The detective starts at the crime scene: the events of the first stage happen right away.
    revealStage(data, 1)

    return data
  },

  getMaxPlayers() {
    return 1
  },

  async start() {
    // Nothing to do: the clock is fictional, it only moves with the actions of the detective.
  },

  advance() {
    return false
  },

  handleAction(data, _userId, action: GameAction, _members, ctx) {
    if (isFinished(data)) {
      throw new ApiException('errors.gameAlreadyOver')
    }

    switch (action?.type) {
      case 'askWitness':
        return askWitness(data, action)
      case 'travel':
        return travel(data, action, ctx)
      case 'accuse':
        return accuse(data, action)
      case 'callCentral':
        return callCentral(data, action, ctx)
      default:
        throw new ApiException('errors.invalidAction')
    }
  },

  isFinished,

  finalize(data, { players }: GameMembers): GamePlayerResult[] {
    const outcome = data.outcome === 'caught' ? GameOutcome.WON : GameOutcome.LOST

    return players.map((player) => ({ userId: player.userId, score: 0, position: 1, outcome }))
  },

  toView(data): DetectiveGameView {
    const finished = isFinished(data)

    return {
      stagesCount: data.stages.length,
      currentStageNumber: finished || isIdentifying(data) ? null : data.currentStage,
      startMinute: data.startMinute,
      elapsedMinutes: data.elapsedMinutes,
      timeLimitMinutes: data.timeLimitMinutes,
      difficulty: data.settings.difficulty,
      witnessMinutes: data.settings.witnessMinutes,
      // Before the last stop, as many as the events revealed so far say (the rest are still to come).
      suspectsCount: !data.lineup
        ? 0
        : finished || isIdentifying(data)
          ? data.lineup.seeds.length
          : getExpectedSuspects(data),
      mistakes: countMistakes(data),
      maxMistakes: getAllowedMistakes(data),
      optionsCount: data.settings.options,
      centralCalls: data.settings.centralCalls ?? 0,
      centralCallMinutes: data.settings.centralCallMinutes ?? 0,
      centralCallEliminates: data.settings.centralCallEliminates ?? 0,
      outcome: data.outcome,
      loot: data.loot,
      origin: toPlace(data.origin),
      currentStage: toCurrentStageView(data),
      playedStages: toPlayedStagesView(data),
      lineup: toLineupView(data),
      route: finished ? [data.origin, ...data.stages.map((stage) => stage.destination)].map(toPlace) : null
    }
  },

  summarize(data): GameSummary {
    return {
      // Cases have no score: only the difficulty and whether the thief was caught.
      score: 0,
      maxScore: null,
      difficulty: data.settings.difficulty,
      completedSteps: data.stages.filter((stage) => stage.travel !== null).length,
      totalSteps: data.stages.length
    }
  }
}
