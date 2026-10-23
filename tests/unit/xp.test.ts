import { describe, expect, it } from 'vitest'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import {
  GameXpInput,
  getGameXp,
  getLevel,
  getLevelProgress,
  getLevelStartXp,
  getRank,
  XP_FIRST_LEVEL,
  XP_LEVEL_STEP
} from '@/app/(protected)/(game)/utils/xp'

const CLASSIC: GameXpInput = {
  mode: GameMode.CLASSIC,
  score: 15000,
  position: 1,
  outcome: null,
  playersCount: 1,
  isDailyChallenge: false,
  isFirstGameOfDay: false
}

describe('xp of a game', () => {
  it('gives XP for finishing and for the score, even a bad game', () => {
    expect(getGameXp(CLASSIC)).toBe(20 + 150)
    expect(getGameXp({ ...CLASSIC, score: 0 })).toBe(20)
    expect(getGameXp({ ...CLASSIC, score: 199 })).toBe(21)
  })

  it('adds the bonus of the daily challenge and of the first game of the day', () => {
    expect(getGameXp({ ...CLASSIC, isDailyChallenge: true })).toBe(170 + 50)
    expect(getGameXp({ ...CLASSIC, isFirstGameOfDay: true })).toBe(170 + 30)
  })

  it('gives the podium bonus only with 2 or more players', () => {
    const multiplayer = { ...CLASSIC, mode: GameMode.CLASSIC_MULTIPLAYER, playersCount: 4 }

    expect(getGameXp({ ...multiplayer, position: 1 })).toBe(170 + 50)
    expect(getGameXp({ ...multiplayer, position: 2 })).toBe(170 + 30)
    expect(getGameXp({ ...multiplayer, position: 3 })).toBe(170 + 15)
    expect(getGameXp({ ...multiplayer, position: 4 })).toBe(170)
    expect(getGameXp({ ...multiplayer, mode: GameMode.BATTLE_ROYALE, position: 1 })).toBe(170 + 50)
    // Alone, the first place is no merit.
    expect(getGameXp({ ...multiplayer, playersCount: 1, position: 1 })).toBe(170)
  })

  it('gives a solved detective case the XP of its difficulty, not of the score', () => {
    const detective = { ...CLASSIC, mode: GameMode.DETECTIVE, score: 0, outcome: GameOutcome.WON }

    expect(getGameXp({ ...detective, difficulty: 'easy' })).toBe(20 + 100)
    expect(getGameXp({ ...detective, difficulty: 'medium' })).toBe(20 + 150)
    expect(getGameXp({ ...detective, difficulty: 'hard' })).toBe(20 + 200)
    expect(getGameXp({ ...detective, outcome: GameOutcome.LOST, difficulty: 'hard' })).toBe(20)
  })
})

describe('levels', () => {
  // The curve is tuned in utils/xp.ts: these tests follow its constants.
  const first = XP_FIRST_LEVEL
  const step = XP_LEVEL_STEP

  it('takes XP_LEVEL_STEP more XP for each level', () => {
    expect([1, 2, 3, 4, 5].map(getLevelStartXp)).toEqual([
      0,
      first,
      2 * first + step,
      3 * first + 3 * step,
      4 * first + 6 * step
    ])
    expect(getLevelStartXp(10)).toBe(9 * first + 36 * step)
  })

  it('gives the level of a total XP', () => {
    expect(getLevel(0)).toBe(1)
    expect(getLevel(first - 1)).toBe(1)
    expect(getLevel(first)).toBe(2)
    expect(getLevel(getLevelStartXp(10) - 1)).toBe(9)
    expect(getLevel(getLevelStartXp(10))).toBe(10)
  })

  it('names the ranks of the levels', () => {
    expect([1, 4, 5, 9, 10, 19, 20, 34, 35, 49, 50, 99].map(getRank)).toEqual([
      'tourist',
      'tourist',
      'backpacker',
      'backpacker',
      'explorer',
      'explorer',
      'cartographer',
      'cartographer',
      'navigator',
      'navigator',
      'legend',
      'legend'
    ])
  })

  it('gives the progress inside the current level', () => {
    expect(getLevelProgress(0)).toEqual({ level: 1, rank: 'tourist', levelXp: 0, nextLevelXp: first })
    expect(getLevelProgress(getLevelStartXp(5) + 10)).toEqual({
      level: 5,
      rank: 'backpacker',
      levelXp: 10,
      nextLevelXp: first + 4 * step
    })
  })
})
