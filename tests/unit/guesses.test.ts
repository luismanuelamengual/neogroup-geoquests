import { describe, expect, it } from 'vitest'
import {
  evaluateGuess,
  getRoundTimeLeftMs,
  isRoundTimeOver,
  parseGuessPosition,
  ROUND_TIME_GRACE_MS
} from '@/app/(protected)/(game)/utils/guesses'

const ANSWER = { latitude: -32.8895, longitude: -68.8458 }
const START = new Date('2026-01-01T10:00:00Z')
const TIMING = { startedAt: START, timeLimitSeconds: 120 }

function at(ms: number): Date {
  return new Date(START.getTime() + ms)
}

describe('guesses', () => {
  it('scores a perfect guess with the full score', () => {
    expect(evaluateGuess(ANSWER, ANSWER, null, START)).toEqual({
      ...ANSWER,
      distanceMeters: 0,
      score: 5000,
      timedOut: false
    })
  })

  it('scores a far away guess with (almost) nothing', () => {
    const result = evaluateGuess(ANSWER, { latitude: 40.4168, longitude: -3.7038 }, null, START)

    expect(result.timedOut).toBe(false)
    expect(result.distanceMeters).toBeGreaterThan(10_000_000)
    expect(result.score).toBe(0)
  })

  it('times out a round without a guess', () => {
    expect(evaluateGuess(ANSWER, null, TIMING, at(1000))).toEqual({
      latitude: null,
      longitude: null,
      distanceMeters: null,
      score: 0,
      timedOut: true
    })
  })

  it('accepts a guess within the grace period and rejects it after', () => {
    expect(evaluateGuess(ANSWER, ANSWER, TIMING, at(120_000 + ROUND_TIME_GRACE_MS - 1)).score).toBe(5000)
    expect(evaluateGuess(ANSWER, ANSWER, TIMING, at(120_000 + ROUND_TIME_GRACE_MS + 1)).timedOut).toBe(true)
    expect(isRoundTimeOver(TIMING, at(120_000))).toBe(false)
  })

  it('computes the time left of a round', () => {
    expect(getRoundTimeLeftMs(TIMING, at(30_000))).toBe(90_000)
    expect(getRoundTimeLeftMs(TIMING, at(200_000))).toBe(0)
  })

  it('validates the position sent by the player', () => {
    expect(parseGuessPosition(null, null)).toBeNull()
    expect(parseGuessPosition(10, 190)).toEqual({ latitude: 10, longitude: -170 })
    expect(() => parseGuessPosition(95, 0)).toThrow('Posición inválida')
    expect(() => parseGuessPosition(10, null)).toThrow('Posición inválida')
    expect(() => parseGuessPosition('abc', 0)).toThrow('Posición inválida')
  })
})
