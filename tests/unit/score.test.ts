import { describe, expect, it } from 'vitest'
import { GAME_MODES, GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { calculateRoundScore, formatDistance, getGameStars } from '@/app/(protected)/(game)/utils/score'

const settings = GAME_MODES[GameMode.WORLD_CITIES].score

describe('calculateRoundScore', () => {
  it('gives the max score for a perfect guess', () => {
    expect(calculateRoundScore(0, settings)).toBe(5000)
    expect(calculateRoundScore(settings.perfectDistanceMeters, settings)).toBe(5000)
  })

  it('decreases with the distance', () => {
    const scores = [100, 1000, 5000, 20000, 100000].map((distance) => calculateRoundScore(distance, settings))

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1])
    }
  })

  it('rewards the right city and gives ~nothing on another continent', () => {
    expect(calculateRoundScore(3000, settings)).toBeGreaterThan(4000)
    expect(calculateRoundScore(1_000_000, settings)).toBe(0)
  })

  it('never returns negative scores or NaN', () => {
    expect(calculateRoundScore(-5, settings)).toBe(0)
    expect(calculateRoundScore(Number.NaN, settings)).toBe(0)
  })
})

describe('formatDistance', () => {
  it('uses meters below 1 km and kilometers above', () => {
    expect(formatDistance(85.4)).toBe('85 m')
    expect(formatDistance(1234)).toBe('1,2 km')
    expect(formatDistance(356_400)).toBe('356 km')
  })
})

describe('getGameStars', () => {
  it('maps the score ratio to 0-3 stars', () => {
    expect(getGameStars(0, 25000)).toBe(0)
    expect(getGameStars(6000, 25000)).toBe(1)
    expect(getGameStars(13000, 25000)).toBe(2)
    expect(getGameStars(21000, 25000)).toBe(3)
  })
})
