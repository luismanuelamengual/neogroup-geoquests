import { AccuseAction } from '@/app/(protected)/(game)/models/AccuseAction'
import { AskWitnessAction } from '@/app/(protected)/(game)/models/AskWitnessAction'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import {
  DetectiveCurrentStageView,
  DetectiveGameView,
  DetectiveLineupView,
  DetectivePlayedStageView
} from '@/app/(protected)/(game)/models/DetectiveGameView'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { DetectiveStop } from '@/app/(protected)/(game)/models/DetectiveStop'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
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
  getDetectiveMaxScore,
  getDetectiveScore,
  getTravelMinutes,
  LOOT_COUNT,
  randomCaseStartMinute
} from '@/app/(protected)/(game)/utils/detective'
import {
  DEFAULT_DETECTIVE_DIFFICULTY,
  getDetectiveGameSettings
} from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import { getLandmarkClue } from '@/app/(protected)/(game)/utils/landmarkClues'
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
 * Talks to a witness of the current stage: it costs `witnessMinutes` the first
 * time; asking again is free. Only while there is time for it: witnesses never
 * end a case, the time runs out (if it does) on the next trip.
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

  if (data.timeLimitMinutes - data.elapsedMinutes < data.settings.witnessMinutes) {
    throw new ApiException('errors.noTimeForWitness')
  }

  stage.askedWitnesses.push(witness)
  spend(data, data.settings.witnessMinutes)

  return true
}

/**
 * Travels to one of the destinations of the current stage. Right: the
 * detective arrives where the suspect was. Wrong: the trip there is wasted and
 * the detective still has to travel to the right one — unless it is one
 * mistake too many (`maxMistakes`): then the trail is lost there. Otherwise the
 * case goes on to the next stage — or, at the last stop, to the suspects (see
 * accuse) — or ends: escaped when the time runs out.
 */
function travel(data: DetectiveGameData, action: TravelAction): boolean {
  const stage = getCurrentStage(data, action.stageNumber)
  const chosen = stage.options.find((option) => option.placeId === Number(action.placeId))

  if (!chosen) {
    throw new ApiException('errors.invalidAction')
  }

  const from = getStageLocation(data, data.currentStage)
  const correct = chosen.placeId === stage.destination.placeId
  const travelMinutes = getTravelMinutes(from, chosen)
  const lostTrail = !correct && countMistakes(data) >= data.settings.maxMistakes
  const redirectMinutes = correct || lostTrail ? 0 : getTravelMinutes(chosen, stage.destination)

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
        clue: asked ? getLandmarkClue(stage.destination.placeName, witness.clueIndex) : null,
        suspectClue: asked ? (witness.suspectClue ?? null) : null
      }
    }),
    options: stage.options.map(toPlace)
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
        askedWitnesses: stage.askedWitnesses.length
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

    return {
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

  handleAction(data, _userId, action: GameAction) {
    if (isFinished(data)) {
      throw new ApiException('errors.gameAlreadyOver')
    }

    switch (action?.type) {
      case 'askWitness':
        return askWitness(data, action)
      case 'travel':
        return travel(data, action)
      case 'accuse':
        return accuse(data, action)
      default:
        throw new ApiException('errors.invalidAction')
    }
  },

  isFinished,

  finalize(data, { players }: GameMembers): GamePlayerResult[] {
    const outcome = data.outcome === 'caught' ? GameOutcome.WON : GameOutcome.LOST

    return players.map((player) => ({ userId: player.userId, score: getDetectiveScore(data), position: 1, outcome }))
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
      suspectsCount: data.lineup?.seeds.length ?? 0,
      mistakes: countMistakes(data),
      maxMistakes: data.settings.maxMistakes,
      outcome: data.outcome,
      score: getDetectiveScore(data),
      maxScore: getDetectiveMaxScore(data.stages.length),
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
      score: getDetectiveScore(data),
      maxScore: getDetectiveMaxScore(data.stages.length),
      completedSteps: data.stages.filter((stage) => stage.travel !== null).length,
      totalSteps: data.stages.length
    }
  }
}
