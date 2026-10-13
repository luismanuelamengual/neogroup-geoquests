import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { haversineDistance } from '@/app/(protected)/(game)/utils/geo'

/**
 * Fictional time of the detective mode. Every trip and every witness costs
 * minutes of a fictional clock; the time available for a case is computed
 * from its route, so short and long routes are equally hard. The numbers that
 * are the same for every difficulty are kept together here to tune the balance.
 */

/** Speed of every trip (a plane), in km/h. */
export const TRAVEL_SPEED_KMH = 900
/** Fixed minutes of every trip (getting to the airport, boarding...). */
export const TRAVEL_FIXED_MINUTES = 60
/** Trips are rounded to this many minutes. */
export const TRAVEL_ROUNDING_MINUTES = 30
/*
 * What changes with the difficulty (witness cost, time margin, mistakes allowed...)
 * is in utils/detectiveDifficulty.ts.
 */

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

/** Distance between two points in km. */
export function distanceKm(from: LatLng, to: LatLng): number {
  return haversineDistance(from, to) / 1000
}

/** Fictional minutes of a trip: fixed time plus the flight, rounded to TRAVEL_ROUNDING_MINUTES (at least one unit). */
export function getTravelMinutes(from: LatLng, to: LatLng): number {
  const minutes = TRAVEL_FIXED_MINUTES + (distanceKm(from, to) / TRAVEL_SPEED_KMH) * 60

  return Math.max(TRAVEL_ROUNDING_MINUTES, Math.round(minutes / TRAVEL_ROUNDING_MINUTES) * TRAVEL_ROUNDING_MINUTES)
}

/**
 * A wrong destination always costs more than asking one more witness: at least
 * this many minutes over `witnessMinutes` (so a mistake is never as cheap as a
 * hint, however close the wrong destination is to the right one).
 */
export const MISTAKE_PENALTY_MARGIN_MINUTES = 30

/**
 * Minutes of the trip from a wrong destination to the right one: the flight
 * itself, or more when the mistake would otherwise cost no more than a witness
 * (the detective loses time finding out where to go next).
 */
export function getRedirectMinutes(from: LatLng, wrong: LatLng, right: LatLng, witnessMinutes: number): number {
  const minimumExtra = witnessMinutes + MISTAKE_PENALTY_MARGIN_MINUTES

  return Math.max(
    getTravelMinutes(wrong, right),
    getTravelMinutes(from, right) + minimumExtra - getTravelMinutes(from, wrong)
  )
}

/**
 * Extra minutes a wrong destination costs: going there and then to the right
 * one, instead of straight (and always more than a witness: see
 * MISTAKE_PENALTY_MARGIN_MINUTES).
 */
export function getMistakeMinutes(from: LatLng, wrong: LatLng, right: LatLng, witnessMinutes: number): number {
  return (
    getTravelMinutes(from, wrong) +
    getRedirectMinutes(from, wrong, right, witnessMinutes) -
    getTravelMinutes(from, right)
  )
}

/** What the time limit of a case is computed from: each hop with its decoys. */
export interface CaseHop {
  from: LatLng
  to: LatLng
  decoys: LatLng[]
}

/**
 * Time limit of a case (minutes, rounded up to the hour): the trips of the
 * perfect route, `witnessBudgetMinutes` for every witness and `mistakesMargin`
 * times the average cost of a mistake in this route.
 */
export function computeTimeLimitMinutes(
  hops: CaseHop[],
  rules: Pick<DetectiveDifficultySettings, 'witnesses' | 'witnessMinutes' | 'witnessBudgetMinutes' | 'mistakesMargin'>
): number {
  const travel = hops.reduce((total, hop) => total + getTravelMinutes(hop.from, hop.to), 0)
  const witnesses = hops.length * rules.witnesses * rules.witnessBudgetMinutes
  const mistakes = hops.flatMap((hop) =>
    hop.decoys.map((decoy) => getMistakeMinutes(hop.from, decoy, hop.to, rules.witnessMinutes))
  )
  const averageMistake = mistakes.length > 0 ? mistakes.reduce((a, b) => a + b, 0) / mistakes.length : 0

  return Math.ceil((travel + witnesses + rules.mistakesMargin * averageMistake) / 60) * 60
}

/** Wrong destinations of a case so far. */
export function countMistakes(data: DetectiveGameData): number {
  return data.stages.filter((stage) => stage.travel && !stage.travel.correct).length
}
