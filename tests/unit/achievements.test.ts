import { describe, expect, it } from 'vitest'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import {
  AchievementGame,
  AchievementProgress,
  getEarnedMedals,
  getMedalKeys
} from '@/app/(protected)/(game)/utils/achievements'

const guess = (distanceMeters: number, score: number) => ({
  latitude: 0,
  longitude: 0,
  distanceMeters,
  score,
  timedOut: false
})
const CLASSIC: AchievementGame = {
  mode: GameMode.CLASSIC,
  isDailyChallenge: false,
  outcome: null,
  playersCount: 1,
  guesses: [guess(50000, 3000), guess(80000, 2500)],
  score: 2000,
  maxScore: 10000,
  detective: null
}
const NO_PROGRESS: AchievementProgress = { gamesPlayed: 0, bestStreak: 0, casesSolved: 0, mapsPlayed: 0, mapsCount: 8 }
const medals = (game: AchievementGame | null, progress: Partial<AchievementProgress> = {}) =>
  getEarnedMedals(game, { ...NO_PROGRESS, ...progress })

describe('achievements', () => {
  it('has 24 medals: 15 of a single play and 9 of the ones gathered over time', () => {
    expect(getMedalKeys()).toEqual([
      'firstTrip',
      'eagleEye',
      'bullseye',
      'starGame.1',
      'starGame.2',
      'starGame.3',
      'earlyBird',
      'friendsChampion',
      'lastStanding',
      'firstCase',
      'inspector',
      'sherlock',
      'cleanCase',
      'againstTheClock.1',
      'againstTheClock.2',
      'frequentTraveler.1',
      'frequentTraveler.2',
      'frequentTraveler.3',
      'steady.1',
      'steady.2',
      'steady.3',
      'careerDetective.1',
      'careerDetective.2',
      'globetrotter'
    ])
  })

  it('gives nothing for an ordinary game', () => {
    expect(medals(CLASSIC)).toEqual([])
  })

  it('rewards close guesses and perfect games', () => {
    expect(medals({ ...CLASSIC, guesses: [guess(99, 4990)] })).toEqual(['eagleEye'])
    expect(medals({ ...CLASSIC, guesses: [guess(20, 5000)] })).toEqual(['eagleEye', 'bullseye'])
    // A timed out round has no distance.
    expect(medals({ ...CLASSIC, guesses: [{ ...guess(0, 0), distanceMeters: null }, null] })).toEqual([])
    // 1 star: bronze; 2 stars: bronze and silver; 3 stars: all of them.
    expect(medals({ ...CLASSIC, score: 3000 })).toEqual(['starGame.1'])
    expect(medals({ ...CLASSIC, score: 6000 })).toEqual(['starGame.1', 'starGame.2'])
    expect(medals({ ...CLASSIC, score: 9000 })).toEqual(['starGame.1', 'starGame.2', 'starGame.3'])
    // Only classic games have stars.
    expect(medals({ ...CLASSIC, mode: GameMode.CLASSIC_MULTIPLAYER, playersCount: 2, score: 9000 })).toEqual([])
    expect(medals({ ...CLASSIC, isDailyChallenge: true })).toEqual(['earlyBird'])
  })

  it('rewards winning against other players, not alone', () => {
    const won = { ...CLASSIC, outcome: GameOutcome.WON, playersCount: 3 }

    expect(medals({ ...won, mode: GameMode.CLASSIC_MULTIPLAYER })).toEqual(['friendsChampion'])
    expect(medals({ ...won, mode: GameMode.BATTLE_ROYALE })).toEqual(['lastStanding'])
    expect(medals({ ...won, mode: GameMode.BATTLE_ROYALE, outcome: GameOutcome.DRAW })).toEqual([])
    expect(medals({ ...won, mode: GameMode.BATTLE_ROYALE, playersCount: 1 })).toEqual([])
  })

  it('rewards solved detective cases: hard, without mistakes or with hours to spare', () => {
    const solved: AchievementGame = {
      ...CLASSIC,
      mode: GameMode.DETECTIVE,
      outcome: GameOutcome.WON,
      guesses: [],
      score: 0,
      maxScore: null,
      detective: { difficulty: 'easy', mistakes: 1, elapsedMinutes: 900, timeLimitMinutes: 1000 }
    }

    expect(medals(solved)).toEqual([])
    expect(medals({ ...solved, detective: { ...solved.detective!, difficulty: 'medium' } })).toEqual(['inspector'])
    expect(medals({ ...solved, detective: { ...solved.detective!, difficulty: 'hard' } })).toEqual(['sherlock'])
    expect(medals({ ...solved, detective: { ...solved.detective!, mistakes: 0 } })).toEqual(['cleanCase'])
    // 5 hours to spare: silver; 8 hours: silver and gold.
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 701 } })).toEqual([])
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 700 } })).toEqual([
      'againstTheClock.1'
    ])
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 520 } })).toEqual([
      'againstTheClock.1',
      'againstTheClock.2'
    ])
    // Not solved: nothing.
    expect(
      medals({
        ...solved,
        outcome: GameOutcome.LOST,
        detective: { difficulty: 'hard', mistakes: 0, elapsedMinutes: 10, timeLimitMinutes: 1000 }
      })
    ).toEqual([])
  })

  it('gives the tiers of what the player gathers over time', () => {
    expect(medals(null, { gamesPlayed: 1 })).toEqual(['firstTrip'])
    expect(medals(null, { gamesPlayed: 100 })).toEqual(['firstTrip', 'frequentTraveler.1', 'frequentTraveler.2'])
    expect(medals(null, { bestStreak: 30 })).toEqual(['steady.1', 'steady.2'])
    expect(medals(null, { casesSolved: 1 })).toEqual(['firstCase'])
    expect(medals(null, { casesSolved: 50 })).toEqual(['firstCase', 'careerDetective.1', 'careerDetective.2'])
    expect(medals(null, { mapsPlayed: 7 })).toEqual([])
    expect(medals(null, { mapsPlayed: 8 })).toEqual(['globetrotter'])
    // Without maps there is nothing to travel to.
    expect(medals(null, { mapsPlayed: 0, mapsCount: 0 })).toEqual([])
  })
})
