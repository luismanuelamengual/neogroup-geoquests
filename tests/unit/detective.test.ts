import { describe, expect, it } from 'vitest'
import { LANDMARK_CLUES } from '@/app/(protected)/(game)/data/landmarkClues'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import {
  CAUGHT_SCORE,
  computeTimeLimitMinutes,
  CORRECT_STAGE_SCORE,
  getDetectiveMaxScore,
  getDetectiveScore,
  getMistakeMinutes,
  getTravelMinutes,
  randomCaseStartMinute,
  TRAVEL_FIXED_MINUTES,
  TRAVEL_ROUNDING_MINUTES
} from '@/app/(protected)/(game)/utils/detective'
import { formatCaseTime, formatDuration } from '@/app/(protected)/(game)/utils/detectiveClock'
import { DETECTIVE_DIFFICULTIES } from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import {
  CLUES_PER_LANDMARK,
  GEOGRAPHY_CLUES,
  getLandmarkClue,
  hasLandmarkClues,
  pickClueIndices
} from '@/app/(protected)/(game)/utils/landmarkClues'
import { LOCALES } from '@/app/i18n/config'
import { createTranslator } from '@/app/i18n/translate'

const RULES = DETECTIVE_DIFFICULTIES.medium
const PARIS = { latitude: 48.8584, longitude: 2.2945 }
const ROME = { latitude: 41.8902, longitude: 12.4922 }
const TOKYO = { latitude: 35.6586, longitude: 139.7454 }
const SYDNEY = { latitude: -33.8568, longitude: 151.2153 }

/** Deterministic random source (a small LCG). */
function seeded(seed: number): () => number {
  let state = seed

  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32

    return state / 2 ** 32
  }
}

describe('detective travel time', () => {
  it('costs the fixed time plus the flight, rounded', () => {
    expect(getTravelMinutes(PARIS, PARIS)).toBe(TRAVEL_FIXED_MINUTES)

    for (const [from, to] of [
      [PARIS, ROME],
      [PARIS, TOKYO],
      [TOKYO, SYDNEY]
    ]) {
      expect(getTravelMinutes(from, to) % TRAVEL_ROUNDING_MINUTES).toBe(0)
      expect(getTravelMinutes(from, to)).toBe(getTravelMinutes(to, from))
    }

    // ~1100 km: about two hours; ~9700 km: about twelve.
    expect(getTravelMinutes(PARIS, ROME)).toBe(120)
    expect(getTravelMinutes(PARIS, TOKYO)).toBeGreaterThan(11 * 60)
    expect(getTravelMinutes(PARIS, TOKYO)).toBeLessThan(13 * 60)
  })

  it('makes a mistake cost the wasted trip and the way back to the right destination', () => {
    expect(getMistakeMinutes(PARIS, TOKYO, ROME)).toBe(
      getTravelMinutes(PARIS, TOKYO) + getTravelMinutes(TOKYO, ROME) - getTravelMinutes(PARIS, ROME)
    )
    expect(getMistakeMinutes(PARIS, TOKYO, ROME)).toBeGreaterThan(0)
  })

  it('computes the time limit from the route: perfect route plus a margin for mistakes, in whole hours', () => {
    const hops = [
      { from: PARIS, to: ROME, decoys: [TOKYO] },
      { from: ROME, to: TOKYO, decoys: [SYDNEY, PARIS] }
    ]
    const perfect = getTravelMinutes(PARIS, ROME) + getTravelMinutes(ROME, TOKYO) + 2 * 3 * RULES.witnessBudgetMinutes
    const mistakes = [
      getMistakeMinutes(PARIS, TOKYO, ROME),
      getMistakeMinutes(ROME, SYDNEY, TOKYO),
      getMistakeMinutes(ROME, PARIS, TOKYO)
    ]
    const average = mistakes.reduce((a, b) => a + b, 0) / mistakes.length
    const limit = computeTimeLimitMinutes(hops, RULES)

    expect(limit % 60).toBe(0)
    expect(limit).toBe(Math.ceil((perfect + RULES.mistakesMargin * average) / 60) * 60)
    // A longer route gives more time.
    expect(computeTimeLimitMinutes([...hops, { from: TOKYO, to: SYDNEY, decoys: [PARIS] }], RULES)).toBeGreaterThan(
      limit
    )
  })

  it('scores the first-try destinations, the catch and the time left over the spare time of the case', () => {
    const stop = (placeId: number, at: { latitude: number; longitude: number }) => ({
      placeId,
      placeName: `p${placeId}`,
      countryCode: 'XX',
      panoId: 'pano',
      ...at
    })
    const perfect = getTravelMinutes(PARIS, ROME) + getTravelMinutes(ROME, TOKYO)
    const stage = (destination: ReturnType<typeof stop>, correct: boolean) =>
      ({
        destination,
        travel: { placeId: destination.placeId, correct, travelMinutes: 0, redirectMinutes: 0 }
      }) as never
    const data = {
      origin: stop(1, PARIS),
      stages: [stage(stop(2, ROME), true), stage(stop(3, TOKYO), false)],
      timeLimitMinutes: perfect + 600,
      elapsedMinutes: perfect,
      outcome: 'caught'
    } as unknown as DetectiveGameData

    // No witness, no mistake (but one): all the time bonus.
    expect(getDetectiveScore(data)).toBe(CORRECT_STAGE_SCORE + CAUGHT_SCORE + 2000)
    // Half of the spare time used: half of it.
    expect(getDetectiveScore({ ...data, elapsedMinutes: perfect + 300 })).toBe(
      CORRECT_STAGE_SCORE + CAUGHT_SCORE + 1000
    )
    // Escaped: only the destinations.
    expect(getDetectiveScore({ ...data, outcome: 'escaped' })).toBe(CORRECT_STAGE_SCORE)
    expect(getDetectiveMaxScore(2)).toBe(2 * CORRECT_STAGE_SCORE + CAUGHT_SCORE + 2000)
  })
})

describe('landmark clues', () => {
  it('picks different clues each time, always with a geography one', () => {
    const random = seeded(42)
    const seen = new Set<string>()

    for (let i = 0; i < 200; i++) {
      const picked = pickClueIndices(3, random)

      expect(picked).toHaveLength(3)
      expect(new Set(picked).size).toBe(3)
      expect(picked.every((index) => index >= 0 && index < CLUES_PER_LANDMARK)).toBe(true)
      expect(picked.some((index) => GEOGRAPHY_CLUES.includes(index))).toBe(true)
      seen.add([...picked].sort().join())
    }

    // Many different combinations (not always the same three).
    expect(seen.size).toBeGreaterThan(5)
  })

  it(`has ${CLUES_PER_LANDMARK} clues per landmark in every language, none naming the place`, () => {
    for (const [name, clues] of Object.entries(LANDMARK_CLUES)) {
      expect(hasLandmarkClues(name), name).toBe(true)

      // The name without what is in parentheses: "Monte Fuji (Lago Kawaguchi)" -> "monte fuji".
      const shortName = name
        .replace(/\(.*\)/, '')
        .trim()
        .toLowerCase()

      for (const locale of LOCALES) {
        expect(clues[locale], `${name} (${locale})`).toHaveLength(CLUES_PER_LANDMARK)

        for (const clue of clues[locale]) {
          expect(clue.trim().length, `${name} (${locale})`).toBeGreaterThan(20)
          expect(clue.toLowerCase(), `${name} (${locale})`).not.toContain(shortName)
        }
      }
    }
  })

  it('gives a clue in every language', () => {
    const [name] = Object.keys(LANDMARK_CLUES)

    expect(getLandmarkClue(name, 0)).toEqual({ es: LANDMARK_CLUES[name].es[0], en: LANDMARK_CLUES[name].en[0] })
    expect(getLandmarkClue(name, CLUES_PER_LANDMARK)).toBeNull()
    expect(getLandmarkClue('Not a landmark', 0)).toBeNull()
  })
})

describe('detective clock', () => {
  it('formats the fictional time of a case, which starts at a random day and hour', () => {
    const t = createTranslator('es')
    const monday9 = 9 * 60

    expect(formatCaseTime(t, monday9, 0)).toBe('lunes 09:00')
    expect(formatCaseTime(t, monday9, 90)).toBe('lunes 10:30')
    expect(formatCaseTime(t, monday9, 2 * 24 * 60 + 90, { short: true })).toBe('mié 10:30')
    expect(formatCaseTime(t, monday9, 15 * 60)).toBe('martes 00:00')
    expect(formatCaseTime(t, monday9, 80 * 60)).toBe('jueves 17:00')
    expect(formatCaseTime(createTranslator('en'), monday9, 80 * 60)).toBe('Thursday 17:00')
    // Starts on any day, and the week wraps around.
    expect(formatCaseTime(t, 6 * 24 * 60 + 16 * 60, 0)).toBe('domingo 16:00')
    expect(formatCaseTime(t, 6 * 24 * 60 + 22 * 60, 3 * 60)).toBe('lunes 01:00')
  })

  it('draws the start of a case on a whole hour between 7:00 and 22:00 of any day', () => {
    const days = new Set<number>()

    for (let i = 0; i < 2000; i++) {
      const start = randomCaseStartMinute(Math.random)
      const hour = (start % (24 * 60)) / 60

      expect(start % 60).toBe(0)
      expect(hour).toBeGreaterThanOrEqual(7)
      expect(hour).toBeLessThanOrEqual(22)
      days.add(Math.floor(start / (24 * 60)))
    }

    expect(days.size).toBe(7)
    expect(randomCaseStartMinute(() => 0)).toBe(7 * 60)
    expect(randomCaseStartMinute(() => 0.999999)).toBe(6 * 24 * 60 + 22 * 60)
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(150)).toBe('2 h 30 min')
    expect(formatDuration(30)).toBe('30 min')
  })
})
