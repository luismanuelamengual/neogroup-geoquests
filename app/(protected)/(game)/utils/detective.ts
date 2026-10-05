import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { haversineDistance } from '@/app/(protected)/(game)/utils/geo'

/**
 * Fictional time of the detective mode. Every trip and every witness costs
 * minutes of a fictional clock; the time available for a case is computed
 * from its route, so short and long routes are equally hard. The numbers are
 * kept together here to tune the balance.
 */

/** Speed of every trip (a plane), in km/h. */
export const TRAVEL_SPEED_KMH = 900
/** Fixed minutes of every trip (getting to the airport, boarding...). */
export const TRAVEL_FIXED_MINUTES = 60
/** Trips are rounded to this many minutes. */
export const TRAVEL_ROUNDING_MINUTES = 30
/** Minutes each witness costs. */
export const WITNESS_MINUTES = 120
/**
 * Minutes per witness the time limit of a case allows for. Less than what a
 * witness costs: asking every witness eats into the margin for mistakes.
 */
export const WITNESS_BUDGET_MINUTES = 60
/**
 * Spare time of a case, in "average mistakes": the time limit allows the
 * perfect route (every witness asked) plus this many times the average extra
 * time a wrong destination costs. 1.25: a mistake has to be paid with fewer
 * witnesses; two are only possible asking very few (tuned simulating cases of
 * the map).
 */
export const MISTAKES_MARGIN = 1.25
/**
 * Wrong destinations allowed in a case: the next one loses the trail of the
 * suspect (the case is lost), however much time is left. Without it, skipping
 * the witnesses and guessing would be enough to catch the suspect.
 */
export const MAX_MISTAKES = 2

/** Different things a thief can steal (detective.loot.loot1… in the dictionaries). */
export const LOOT_COUNT = 10
/** The fictional clock of every case starts at a random hour (whole hours) between these two, any day of the week. */
export const CASE_START_FIRST_HOUR = 7
export const CASE_START_LAST_HOUR = 22

/** Random start of a case: minutes since Monday 0:00 (a whole hour from CASE_START_FIRST_HOUR to CASE_START_LAST_HOUR). */
export function randomCaseStartMinute(random: () => number): number {
  const day = Math.floor(random() * 7)
  const hour = CASE_START_FIRST_HOUR + Math.floor(random() * (CASE_START_LAST_HOUR - CASE_START_FIRST_HOUR + 1))

  return day * 24 * 60 + hour * 60
}

/** Points of each destination guessed at the first try. */
export const CORRECT_STAGE_SCORE = 400
/** Points for catching the suspect. */
export const CAUGHT_SCORE = 1000
/**
 * Points for the time left when the suspect is caught, in proportion to the
 * spare time of the case (its limit minus the trips of the perfect route):
 * all of them without asking any witness nor making mistakes.
 */
export const TIME_LEFT_SCORE = 2000

/** Distance between two points in km. */
export function distanceKm(from: LatLng, to: LatLng): number {
  return haversineDistance(from, to) / 1000
}

/** Fictional minutes of a trip: fixed time plus the flight, rounded to TRAVEL_ROUNDING_MINUTES (at least one unit). */
export function getTravelMinutes(from: LatLng, to: LatLng): number {
  const minutes = TRAVEL_FIXED_MINUTES + (distanceKm(from, to) / TRAVEL_SPEED_KMH) * 60

  return Math.max(TRAVEL_ROUNDING_MINUTES, Math.round(minutes / TRAVEL_ROUNDING_MINUTES) * TRAVEL_ROUNDING_MINUTES)
}

/** Extra minutes a wrong destination costs: going there and then to the right one, instead of straight. */
export function getMistakeMinutes(from: LatLng, wrong: LatLng, right: LatLng): number {
  return getTravelMinutes(from, wrong) + getTravelMinutes(wrong, right) - getTravelMinutes(from, right)
}

/** What the time limit of a case is computed from: each hop with its decoys. */
export interface CaseHop {
  from: LatLng
  to: LatLng
  decoys: LatLng[]
}

/**
 * Time limit of a case (minutes, rounded up to the hour): the trips of the
 * perfect route, WITNESS_BUDGET_MINUTES for every witness and MISTAKES_MARGIN
 * times the average cost of a mistake in this route.
 */
export function computeTimeLimitMinutes(hops: CaseHop[], witnessesPerStage: number): number {
  const travel = hops.reduce((total, hop) => total + getTravelMinutes(hop.from, hop.to), 0)
  const witnesses = hops.length * witnessesPerStage * WITNESS_BUDGET_MINUTES
  const mistakes = hops.flatMap((hop) => hop.decoys.map((decoy) => getMistakeMinutes(hop.from, decoy, hop.to)))
  const averageMistake = mistakes.length > 0 ? mistakes.reduce((a, b) => a + b, 0) / mistakes.length : 0

  return Math.ceil((travel + witnesses + MISTAKES_MARGIN * averageMistake) / 60) * 60
}

/** Minutes of the trips of the perfect route of a case (straight from stop to stop, no witnesses). */
export function getPerfectTravelMinutes(data: DetectiveGameData): number {
  const route = [data.origin, ...data.stages.map((stage) => stage.destination)]

  return data.stages.reduce((total, stage, index) => total + getTravelMinutes(route[index], stage.destination), 0)
}

/** Best possible score of a case of `hops` stages. */
export function getDetectiveMaxScore(hops: number): number {
  return hops * CORRECT_STAGE_SCORE + CAUGHT_SCORE + TIME_LEFT_SCORE
}

/** Wrong destinations of a case so far. */
export function countMistakes(data: DetectiveGameData): number {
  return data.stages.filter((stage) => stage.travel && !stage.travel.correct).length
}

/** Score of a case: the destinations guessed at the first try, and catching the suspect with time to spare. */
export function getDetectiveScore(data: DetectiveGameData): number {
  const correct = data.stages.filter((stage) => stage.travel?.correct).length
  let score = correct * CORRECT_STAGE_SCORE

  if (data.outcome === 'caught') {
    const left = Math.max(0, data.timeLimitMinutes - data.elapsedMinutes)
    const spare = Math.max(1, data.timeLimitMinutes - getPerfectTravelMinutes(data))

    score += CAUGHT_SCORE + Math.min(TIME_LEFT_SCORE, Math.round((TIME_LEFT_SCORE * left) / spare))
  }

  return score
}
