import { describe, expect, it } from 'vitest'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import {
  AchievementGame,
  AchievementProgress,
  AchievementStage,
  addGameStats,
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
  mapSlug: 'famous-cities',
  rightCountries: [],
  durationSeconds: 600,
  guesses: [guess(50000, 3000), guess(80000, 2500)],
  score: 2000,
  maxScore: 10000,
  detective: null
}
const NO_PROGRESS: AchievementProgress = {
  gamesPlayed: 0,
  bestStreak: 0,
  casesSolved: 0,
  mapsPlayed: 0,
  mapsCount: 8,
  level: 1,
  stats: {}
}
/** A stage of a case: right destination, after asking a witness, without events. */
const stage = (changes: Partial<AchievementStage> = {}): AchievementStage => ({
  correct: true,
  witnessesAsked: 1,
  calls: 0,
  events: [],
  ...changes
})
const SOLVED: AchievementGame = {
  ...CLASSIC,
  mode: GameMode.DETECTIVE,
  outcome: GameOutcome.WON,
  mapSlug: 'landmarks',
  guesses: [],
  score: 0,
  maxScore: null,
  detective: { difficulty: 'easy', mistakes: 1, elapsedMinutes: 900, timeLimitMinutes: 1000, stages: [stage()] }
}
const medals = (game: AchievementGame | null, progress: Partial<AchievementProgress> = {}) =>
  getEarnedMedals(game, { ...NO_PROGRESS, ...progress })

describe('achievements', () => {
  it('has 47 medals: 22 of a single play and 25 of the ones gathered over time', () => {
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
      'againstTheClock.3',
      'justInTime',
      'quickCase.1',
      'quickCase.2',
      'quickCase.3',
      'noHints',
      'centralCaller',
      'frequentTraveler.1',
      'frequentTraveler.2',
      'frequentTraveler.3',
      'steady.1',
      'steady.2',
      'steady.3',
      'careerDetective.1',
      'careerDetective.2',
      'careerDetective.3',
      'globetrotter',
      'levels.1',
      'levels.2',
      'levels.3',
      'tracker.1',
      'tracker.2',
      'tracker.3',
      'allContinents',
      'instinct',
      'badLuck',
      'goodLuck',
      'iconicPlaces.1',
      'iconicPlaces.2',
      'iconicPlaces.3',
      'classicWithFriends',
      'battleRoyalePlayer'
    ])
  })

  it('gives nothing for an ordinary game', () => {
    expect(medals(CLASSIC)).toEqual([])
  })

  it('rewards close guesses and perfect games', () => {
    expect(medals({ ...CLASSIC, guesses: [guess(999, 4950)] })).toEqual(['eagleEye'])
    expect(medals({ ...CLASSIC, guesses: [guess(99, 4990)] })).toEqual(['eagleEye', 'bullseye'])
    // A perfect score doesn't matter, only the distance.
    expect(medals({ ...CLASSIC, guesses: [guess(104, 5000)] })).toEqual(['eagleEye'])
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
    const solved = SOLVED

    expect(medals(solved)).toEqual([])
    expect(medals({ ...solved, detective: { ...solved.detective!, difficulty: 'medium' } })).toEqual(['inspector'])
    expect(medals({ ...solved, detective: { ...solved.detective!, difficulty: 'hard' } })).toEqual(['sherlock'])
    expect(medals({ ...solved, detective: { ...solved.detective!, mistakes: 0 } })).toEqual(['cleanCase'])
    // 5 hours to spare: bronze; 8 hours: bronze and silver; 10 hours: all of them.
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 701 } })).toEqual([])
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 700 } })).toEqual([
      'againstTheClock.1'
    ])
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 520 } })).toEqual([
      'againstTheClock.1',
      'againstTheClock.2'
    ])
    expect(medals({ ...solved, detective: { ...solved.detective!, elapsedMinutes: 400 } })).toEqual([
      'againstTheClock.1',
      'againstTheClock.2',
      'againstTheClock.3'
    ])
    // Not solved: nothing.
    expect(
      medals({
        ...solved,
        outcome: GameOutcome.LOST,
        detective: {
          difficulty: 'hard',
          mistakes: 0,
          elapsedMinutes: 1000,
          timeLimitMinutes: 1000,
          stages: [stage({ witnessesAsked: 0, calls: 2 })]
        },
        durationSeconds: 30
      })
    ).toEqual([])
  })

  it('rewards cases solved just in time, quickly, without help or calling the central office twice', () => {
    const detective = SOLVED.detective!

    expect(medals({ ...SOLVED, detective: { ...detective, elapsedMinutes: 1000 } })).toEqual(['justInTime'])
    // Quick: only on medium or hard, in real time (less than 4, 3 or 2 minutes).
    expect(medals({ ...SOLVED, durationSeconds: 100 })).toEqual([])
    const medium = { ...SOLVED, detective: { ...detective, difficulty: 'medium' as const } }

    expect(medals({ ...medium, durationSeconds: 240 })).toEqual(['inspector'])
    expect(medals({ ...medium, durationSeconds: 239 })).toEqual(['inspector', 'quickCase.1'])
    expect(medals({ ...medium, durationSeconds: 179 })).toEqual(['inspector', 'quickCase.1', 'quickCase.2'])
    expect(medals({ ...medium, durationSeconds: 119 })).toEqual([
      'inspector',
      'quickCase.1',
      'quickCase.2',
      'quickCase.3'
    ])
    expect(medals({ ...medium, durationSeconds: null })).toEqual(['inspector'])
    // Without any witness nor call in the whole case.
    expect(medals({ ...SOLVED, detective: { ...detective, stages: [stage(), stage({ witnessesAsked: 0 })] } })).toEqual(
      []
    )
    expect(
      medals({
        ...SOLVED,
        detective: { ...detective, stages: [stage({ witnessesAsked: 0 }), stage({ witnessesAsked: 0 })] }
      })
    ).toEqual(['noHints'])
    expect(
      medals({ ...SOLVED, detective: { ...detective, stages: [stage({ witnessesAsked: 0, calls: 1 })] } })
    ).toEqual([])
    // Two calls (or more), in one stage or in several.
    expect(
      medals({ ...SOLVED, detective: { ...detective, stages: [stage({ calls: 1 }), stage({ calls: 1 })] } })
    ).toEqual(['centralCaller'])
    expect(medals({ ...SOLVED, detective: { ...detective, stages: [stage({ calls: 1 })] } })).toEqual([])
  })

  it('gives the tiers of what the player gathers over time', () => {
    expect(medals(null, { gamesPlayed: 1 })).toEqual(['firstTrip'])
    expect(medals(null, { gamesPlayed: 100 })).toEqual(['firstTrip', 'frequentTraveler.1', 'frequentTraveler.2'])
    expect(medals(null, { bestStreak: 30 })).toEqual(['steady.1', 'steady.2'])
    expect(medals(null, { casesSolved: 1 })).toEqual(['firstCase'])
    expect(medals(null, { casesSolved: 50 })).toEqual(['firstCase', 'careerDetective.1', 'careerDetective.2'])
    expect(medals(null, { casesSolved: 100 })).toEqual([
      'firstCase',
      'careerDetective.1',
      'careerDetective.2',
      'careerDetective.3'
    ])
    expect(medals(null, { mapsPlayed: 7 })).toEqual([])
    expect(medals(null, { mapsPlayed: 8 })).toEqual(['globetrotter'])
    // Without maps there is nothing to travel to.
    expect(medals(null, { mapsPlayed: 0, mapsCount: 0 })).toEqual([])
    expect(medals(null, { level: 9 })).toEqual([])
    expect(medals(null, { level: 20 })).toEqual(['levels.1', 'levels.2'])
    expect(medals(null, { stats: { rightCountries: 100, continents: ['africa', 'asia', 'europe'] } })).toEqual([
      'tracker.1',
      'tracker.2'
    ])
    expect(
      medals(null, { stats: { continents: ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania'] } })
    ).toEqual(['allContinents'])
    expect(
      medals(null, {
        stats: {
          blindDestinations: 10,
          badLuckStages: 10,
          goodLuckStages: 9,
          iconicPlaces: 10,
          classicMultiplayerGames: 10,
          battleRoyaleGames: 10
        }
      })
    ).toEqual(['instinct', 'badLuck', 'iconicPlaces.1', 'iconicPlaces.2', 'classicWithFriends', 'battleRoyalePlayer'])
  })

  it('counts what a game adds to the counters of the achievements', () => {
    const stats = addGameStats(
      { rightCountries: 3, continents: ['southAmerica'], goodLuckStages: 1 },
      {
        ...SOLVED,
        detective: {
          ...SOLVED.detective!,
          stages: [
            stage({ witnessesAsked: 0, events: [false, false] }),
            stage({ correct: false, witnessesAsked: 0, events: [true, false] }),
            stage({ events: [true, true] }),
            stage({ witnessesAsked: 0, calls: 1, events: [true] }),
            stage({ correct: null, witnessesAsked: 0 })
          ]
        }
      }
    )

    expect(stats).toEqual({
      rightCountries: 3,
      blindDestinations: 1,
      continents: ['southAmerica'],
      badLuckStages: 1,
      goodLuckStages: 2,
      iconicPlaces: 0,
      classicMultiplayerGames: 0,
      battleRoyaleGames: 0
    })
    // Right countries (of classic games) and their continents.
    expect(
      addGameStats({ continents: ['europe'] }, { ...CLASSIC, rightCountries: ['JP', 'FR', 'ZA', 'JP'] })
    ).toMatchObject({ rightCountries: 4, continents: ['europe', 'asia', 'africa'] })
    // Iconic places: rounds of the landmarks map less than 2 km away.
    const landmarks = { ...CLASSIC, mapSlug: 'landmarks', guesses: [guess(1999, 4900), guess(2000, 4900), null] }

    expect(addGameStats({}, landmarks).iconicPlaces).toBe(1)
    expect(addGameStats({}, { ...landmarks, mapSlug: 'famous-cities' }).iconicPlaces).toBe(0)
    expect(addGameStats({ battleRoyaleGames: 2 }, { ...CLASSIC, mode: GameMode.BATTLE_ROYALE }).battleRoyaleGames).toBe(
      3
    )
    expect(addGameStats({}, { ...CLASSIC, mode: GameMode.CLASSIC_MULTIPLAYER }).classicMultiplayerGames).toBe(1)
  })
})
