import { AskWitnessAction } from '@/app/(protected)/(game)/models/AskWitnessAction'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveGameSettings } from '@/app/(protected)/(game)/models/DetectiveGameSettings'
import {
  DetectiveCurrentStageView,
  DetectiveGameView,
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
  MAX_MISTAKES,
  WITNESS_MINUTES
} from '@/app/(protected)/(game)/utils/detective'
import { getLandmarkClue } from '@/app/(protected)/(game)/utils/landmarkClues'
import { ApiException } from '@/app/models/ApiException'

/** The only map of the mode: its landmarks have the clues the witnesses give. */
export const DETECTIVE_MAP_NAME = 'Lugares icónicos'

const definition: GameModeDefinition<DetectiveGameSettings> = {
  mode: GameMode.DETECTIVE,
  slug: 'detective',
  name: 'Detective',
  description:
    'Seguí el rastro de un ladrón por cinco lugares icónicos del mundo: hablá con testigos, elegí a dónde viajar y atrapalo antes de que se acabe el tiempo.',
  image: '/modes/detective.png',
  minPlayers: 1,
  maxPlayers: 1,
  realtime: false,
  mapName: DETECTIVE_MAP_NAME,
  settings: { hops: 5, options: 4, witnesses: 3, minHopKm: 500 },
  // Fixed rules: the time available comes from the route of each case.
  configurable: {},
  // Left unfinished for a day: deleted (like the classic games).
  abandonAfterMs: 24 * 60 * 60 * 1000,
  abandonAction: 'delete'
}

function isFinished(data: DetectiveGameData): boolean {
  return data.outcome !== null
}

function getCurrentStage(data: DetectiveGameData, stageNumber: unknown): DetectiveStage {
  if (Number(stageNumber) !== data.currentStage) {
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
 * Talks to a witness of the current stage: it costs WITNESS_MINUTES the first
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

  if (data.timeLimitMinutes - data.elapsedMinutes < WITNESS_MINUTES) {
    throw new ApiException('errors.noTimeForWitness')
  }

  stage.askedWitnesses.push(witness)
  spend(data, WITNESS_MINUTES)

  return true
}

/**
 * Travels to one of the destinations of the current stage. Right: the
 * detective arrives where the suspect was. Wrong: the trip there is wasted and
 * the detective still has to travel to the right one — unless it is one
 * mistake too many (MAX_MISTAKES): then the trail is lost there. Otherwise the
 * case goes on to the next stage — or ends: caught at the last stop, or
 * escaped when the time runs out.
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
  const lostTrail = !correct && countMistakes(data) >= MAX_MISTAKES
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

  if (data.currentStage > data.stages.length) {
    data.outcome = 'caught'
  }

  return true
}

function toCurrentStageView(data: DetectiveGameData): DetectiveCurrentStageView | null {
  if (isFinished(data)) {
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
        clue: asked ? getLandmarkClue(stage.destination.placeName, witness.clueIndex) : null
      }
    }),
    options: stage.options.map(toPlace)
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
 * landmarks ("Lugares icónicos"). At every stage the player explores where the
 * detective is (Street View of the current stop) — the suspect already left,
 * so only the witnesses there give clues about the next stop — and travels to
 * one of the destinations offered, all against a fictional clock computed from
 * the route (see utils/detective.ts).
 */
export const detectiveMode: GameModeEngine<DetectiveGameData, DetectiveGameSettings, DetectiveGameView> = {
  definition,

  async create(mapId, settings, ctx) {
    if (mapId == null) {
      throw new ApiException('errors.mapNotFound', 404)
    }

    const plan = await planDetectiveCase(await getMapPlaces(mapId), settings, ctx.finder, ctx.random)

    return {
      v: 1,
      settings,
      loot: Math.floor(ctx.random() * LOOT_COUNT),
      origin: plan.origin,
      stages: plan.stages,
      currentStage: 1,
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
      currentStageNumber: finished ? null : data.currentStage,
      elapsedMinutes: data.elapsedMinutes,
      timeLimitMinutes: data.timeLimitMinutes,
      witnessMinutes: WITNESS_MINUTES,
      mistakes: countMistakes(data),
      maxMistakes: MAX_MISTAKES,
      outcome: data.outcome,
      score: getDetectiveScore(data),
      maxScore: getDetectiveMaxScore(data.stages.length),
      loot: data.loot,
      origin: toPlace(data.origin),
      currentStage: toCurrentStageView(data),
      playedStages: toPlayedStagesView(data),
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
