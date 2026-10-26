import { AchievementStats } from '@/app/(protected)/(game)/models/AchievementStats'
import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { GameGuess } from '@/app/(protected)/(game)/models/GameGuess'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { CONTINENTS, getContinent } from '@/app/(protected)/(game)/utils/continents'
import { getGameStars } from '@/app/(protected)/(game)/utils/score'

/**
 * Achievements of the players: a fixed catalog (like the game modes; names in
 * i18n, `achievements.items.<id>`), checked when each game ends (see
 * services/progress.ts). Some are earned with one play ("game"), the others
 * by gathering over time ("progress"). Some come in tiers (bronze, silver,
 * gold): each tier is a medal of its own, stored as `<id>.<tier>` (1-based) in
 * `user_achievements`. Every medal gives XP_PER_ACHIEVEMENT extra XP.
 */

/** XP of every medal won. */
export const XP_PER_ACHIEVEMENT = 50

/** A guess closer than this (meters) earns "eagle eye". */
export const EAGLE_EYE_METERS = 1000

/** A guess closer than this (meters) earns "bullseye". */
export const BULLSEYE_METERS = 100

/** A guess of a round of the landmarks map closer than this (meters) counts for "iconic places". */
export const ICONIC_PLACE_METERS = 2000

/** Map of the iconic places (its rounds count for "iconic places"). */
export const ICONIC_PLACES_MAP_SLUG = 'landmarks'

/** A stage of a detective case the detective got to, to check the achievements. */
export interface AchievementStage {
  /** Whether the detective traveled to the right destination; null: it did not travel from there. */
  correct: boolean | null
  witnessesAsked: number
  calls: number
  /** Its random events: true the good ones, false the bad ones. */
  events: boolean[]
}

/** What a finished game says about one of its players, to check the achievements. */
export interface AchievementGame {
  mode: GameMode
  isDailyChallenge: boolean
  outcome: GameOutcome | null
  /** Players with a result in the game. */
  playersCount: number
  /** Slug of the map of the game (null: none). */
  mapSlug: string | null
  /** Classic modes: the country of each round whose guess fell in it (see utils/countries.ts). */
  rightCountries: string[]
  /** Real time from the start of the game to its end (seconds; null: unknown). */
  durationSeconds: number | null
  /** The player's guesses (round based modes; empty in detective). */
  guesses: (GameGuess | null)[]
  /** Classic games: total score and the most it could have been. */
  score: number
  maxScore: number | null
  /** Detective cases only. */
  detective: {
    difficulty: DetectiveDifficulty
    mistakes: number
    elapsedMinutes: number
    timeLimitMinutes: number
    /** The stages the detective got to, in order. */
    stages: AchievementStage[]
  } | null
}

/** The progress of the player after the game (see player_progress). */
export interface AchievementProgress {
  gamesPlayed: number
  bestStreak: number
  casesSolved: number
  /** Distinct maps the player played in. */
  mapsPlayed: number
  /** Maps there are to play in. */
  mapsCount: number
  /** Level of the player (see utils/xp.ts). */
  level: number
  /** The other counters (see AchievementStats; missing keys count as zero). */
  stats: AchievementStats
}

export type TierName = 'bronze' | 'silver' | 'gold'

/** Names of the tiers by default (i18n `achievements.tiers.<name>`), by tier − 1. */
export const TIER_NAMES: TierName[] = ['bronze', 'silver', 'gold']

/** A tier of an achievement earned with one play. */
interface GameTier {
  name: TierName
  /** Number its description shows (`{count}`, e.g. the hours to spare). */
  target: number
  earned: (game: AchievementGame) => boolean
}

interface GameAchievement {
  id: string
  icon: string
  kind: 'game'
  /** A single medal: */
  earned?: (game: AchievementGame) => boolean
  /** Or one medal per tier (easiest first): */
  tiers?: GameTier[]
}

interface ProgressAchievement {
  id: string
  icon: string
  kind: 'progress'
  /** How far the player is (compared with `tiers`). */
  value: (progress: AchievementProgress) => number
  /** Value needed for each tier, in order; `null`: the number of maps (globetrotter). */
  tiers: (number | null)[]
}

export type Achievement = GameAchievement | ProgressAchievement

const solved = (game: AchievementGame) => game.mode === GameMode.DETECTIVE && game.outcome === GameOutcome.WON
const won = (game: AchievementGame, mode: GameMode) =>
  game.mode === mode && game.playersCount >= 2 && game.outcome === GameOutcome.WON
const guessed = (game: AchievementGame) => game.guesses.filter((guess): guess is GameGuess => !!guess)
const stars = (game: AchievementGame) =>
  game.mode === GameMode.CLASSIC && game.maxScore !== null ? getGameStars(game.score, game.maxScore) : 0
/** Fictional minutes the detective had to spare when it caught the thief. */
const minutesToSpare = (game: AchievementGame) =>
  solved(game) && game.detective ? game.detective.timeLimitMinutes - game.detective.elapsedMinutes : -1
const stagesOf = (game: AchievementGame) => game.detective?.stages ?? []
const callsOf = (game: AchievementGame) => stagesOf(game).reduce((total, stage) => total + stage.calls, 0)
/** A solved case on medium or hard, in less than `minutes` of real time. */
const quickCase = (game: AchievementGame, minutes: number) =>
  solved(game) &&
  game.detective?.difficulty !== 'easy' &&
  game.durationSeconds !== null &&
  game.durationSeconds < minutes * 60
/** Without any help at a stage: no witness asked, no call to the central office. */
const noHelp = (stage: AchievementStage) => stage.witnessesAsked === 0 && stage.calls === 0
/** A stage with two random events, all of them good (`good` true) or bad (false). */
const luckyStage = (stage: AchievementStage, good: boolean) =>
  stage.events.length >= 2 && stage.events.every((event) => event === good)

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstTrip', icon: '✈️', kind: 'progress', value: (progress) => progress.gamesPlayed, tiers: [1] },
  {
    id: 'eagleEye',
    icon: '🦅',
    kind: 'game',
    earned: (game) =>
      guessed(game).some((guess) => guess.distanceMeters !== null && guess.distanceMeters < EAGLE_EYE_METERS)
  },
  {
    id: 'bullseye',
    icon: '🎯',
    kind: 'game',
    earned: (game) =>
      guessed(game).some((guess) => guess.distanceMeters !== null && guess.distanceMeters < BULLSEYE_METERS)
  },
  {
    id: 'starGame',
    icon: '⭐',
    kind: 'game',
    tiers: [
      { name: 'bronze', target: 1, earned: (game) => stars(game) >= 1 },
      { name: 'silver', target: 2, earned: (game) => stars(game) >= 2 },
      { name: 'gold', target: 3, earned: (game) => stars(game) >= 3 }
    ]
  },
  { id: 'earlyBird', icon: '🌅', kind: 'game', earned: (game) => game.isDailyChallenge },
  {
    id: 'friendsChampion',
    icon: '🏆',
    kind: 'game',
    earned: (game) => won(game, GameMode.CLASSIC_MULTIPLAYER)
  },
  { id: 'lastStanding', icon: '👑', kind: 'game', earned: (game) => won(game, GameMode.BATTLE_ROYALE) },
  { id: 'firstCase', icon: '🔎', kind: 'progress', value: (progress) => progress.casesSolved, tiers: [1] },
  {
    id: 'inspector',
    icon: '🎩',
    kind: 'game',
    earned: (game) => solved(game) && game.detective?.difficulty === 'medium'
  },
  {
    id: 'sherlock',
    icon: '🕵️',
    kind: 'game',
    earned: (game) => solved(game) && game.detective?.difficulty === 'hard'
  },
  {
    id: 'cleanCase',
    icon: '🔍',
    kind: 'game',
    earned: (game) => solved(game) && game.detective?.mistakes === 0
  },
  {
    id: 'againstTheClock',
    icon: '⏱️',
    kind: 'game',
    tiers: [
      { name: 'bronze', target: 5, earned: (game) => minutesToSpare(game) >= 5 * 60 },
      { name: 'silver', target: 8, earned: (game) => minutesToSpare(game) >= 8 * 60 },
      { name: 'gold', target: 10, earned: (game) => minutesToSpare(game) >= 10 * 60 }
    ]
  },
  { id: 'justInTime', icon: '⌛', kind: 'game', earned: (game) => minutesToSpare(game) === 0 },
  {
    id: 'quickCase',
    icon: '⚡',
    kind: 'game',
    tiers: [
      { name: 'bronze', target: 4, earned: (game) => quickCase(game, 4) },
      { name: 'silver', target: 3, earned: (game) => quickCase(game, 3) },
      { name: 'gold', target: 2, earned: (game) => quickCase(game, 2) }
    ]
  },
  {
    id: 'noHints',
    icon: '🧠',
    kind: 'game',
    earned: (game) => solved(game) && stagesOf(game).length > 0 && stagesOf(game).every(noHelp)
  },
  { id: 'centralCaller', icon: '📞', kind: 'game', earned: (game) => solved(game) && callsOf(game) >= 2 },
  {
    id: 'frequentTraveler',
    icon: '🧳',
    kind: 'progress',
    value: (progress) => progress.gamesPlayed,
    tiers: [10, 100, 500]
  },
  { id: 'steady', icon: '🔥', kind: 'progress', value: (progress) => progress.bestStreak, tiers: [7, 30, 100] },
  {
    id: 'careerDetective',
    icon: '🗂️',
    kind: 'progress',
    value: (progress) => progress.casesSolved,
    tiers: [10, 50, 100]
  },
  { id: 'globetrotter', icon: '🌍', kind: 'progress', value: (progress) => progress.mapsPlayed, tiers: [null] },
  { id: 'levels', icon: '🎖️', kind: 'progress', value: (progress) => progress.level, tiers: [10, 20, 30] },
  {
    id: 'tracker',
    icon: '🐾',
    kind: 'progress',
    value: (progress) => progress.stats.rightCountries ?? 0,
    tiers: [30, 100, 200]
  },
  {
    id: 'allContinents',
    icon: '🗺️',
    kind: 'progress',
    value: (progress) => progress.stats.continents?.length ?? 0,
    tiers: [CONTINENTS.length]
  },
  {
    id: 'instinct',
    icon: '🔮',
    kind: 'progress',
    value: (progress) => progress.stats.blindDestinations ?? 0,
    tiers: [10]
  },
  { id: 'badLuck', icon: '🐈‍⬛', kind: 'progress', value: (progress) => progress.stats.badLuckStages ?? 0, tiers: [10] },
  {
    id: 'goodLuck',
    icon: '🍀',
    kind: 'progress',
    value: (progress) => progress.stats.goodLuckStages ?? 0,
    tiers: [10]
  },
  {
    id: 'iconicPlaces',
    icon: '🗽',
    kind: 'progress',
    value: (progress) => progress.stats.iconicPlaces ?? 0,
    tiers: [5, 10, 20]
  },
  {
    id: 'classicWithFriends',
    icon: '🎉',
    kind: 'progress',
    value: (progress) => progress.stats.classicMultiplayerGames ?? 0,
    tiers: [10]
  },
  {
    id: 'battleRoyalePlayer',
    icon: '⚔️',
    kind: 'progress',
    value: (progress) => progress.stats.battleRoyaleGames ?? 0,
    tiers: [10]
  }
]

/** The counters of AchievementStats after a game (`stats`: the ones before it). */
export function addGameStats(stats: AchievementStats, game: AchievementGame): AchievementStats {
  const stages = stagesOf(game)
  const right = stages.filter((stage) => stage.correct === true)
  const continents = game.rightCountries.flatMap((country) => getContinent(country) ?? [])
  const iconic =
    game.mapSlug === ICONIC_PLACES_MAP_SLUG
      ? guessed(game).filter((guess) => guess.distanceMeters !== null && guess.distanceMeters < ICONIC_PLACE_METERS)
          .length
      : 0

  return {
    ...stats,
    rightCountries: (stats.rightCountries ?? 0) + game.rightCountries.length,
    blindDestinations: (stats.blindDestinations ?? 0) + right.filter(noHelp).length,
    continents: [...new Set([...(stats.continents ?? []), ...continents])],
    badLuckStages: (stats.badLuckStages ?? 0) + stages.filter((stage) => luckyStage(stage, false)).length,
    goodLuckStages: (stats.goodLuckStages ?? 0) + stages.filter((stage) => luckyStage(stage, true)).length,
    iconicPlaces: (stats.iconicPlaces ?? 0) + iconic,
    classicMultiplayerGames:
      (stats.classicMultiplayerGames ?? 0) + (game.mode === GameMode.CLASSIC_MULTIPLAYER ? 1 : 0),
    battleRoyaleGames: (stats.battleRoyaleGames ?? 0) + (game.mode === GameMode.BATTLE_ROYALE ? 1 : 0)
  }
}

/** How many medals an achievement has (1: no tiers). */
export function getTiersCount(achievement: Achievement): number {
  return achievement.tiers?.length ?? 1
}

/** Name of a tier of an achievement with tiers. */
export function getTierName(achievement: Achievement, tier: number): TierName {
  return (achievement.kind === 'game' ? achievement.tiers?.[tier - 1]?.name : null) ?? TIER_NAMES[tier - 1]
}

/** Key of a medal: the id, plus the tier (1-based) when the achievement has more than one. */
export function getMedalKey(achievement: Achievement, tier = 1): string {
  return getTiersCount(achievement) > 1 ? `${achievement.id}.${tier}` : achievement.id
}

/** Every medal of the catalog, in order. */
export function getMedalKeys(): string[] {
  return ACHIEVEMENTS.flatMap((achievement) =>
    Array.from({ length: getTiersCount(achievement) }, (_, index) => getMedalKey(achievement, index + 1))
  )
}

/** Value a tier of a progress achievement needs. */
export function getTierTarget(achievement: ProgressAchievement, tier: number, progress: AchievementProgress): number {
  return achievement.tiers[tier - 1] ?? progress.mapsCount
}

/**
 * Medals the player has after a game (`game`) or just from its progress
 * (`game` null: e.g. the medals of the games played before the achievements
 * existed). Already won medals are included too: the caller keeps the new ones.
 */
export function getEarnedMedals(game: AchievementGame | null, progress: AchievementProgress): string[] {
  return ACHIEVEMENTS.flatMap((achievement) => {
    if (achievement.kind === 'game') {
      if (!game) {
        return []
      }

      if (achievement.tiers) {
        return achievement.tiers.flatMap((tier, index) =>
          tier.earned(game) ? [getMedalKey(achievement, index + 1)] : []
        )
      }

      return achievement.earned?.(game) ? [getMedalKey(achievement)] : []
    }

    const value = achievement.value(progress)

    return achievement.tiers.flatMap((_, index) => {
      const target = getTierTarget(achievement, index + 1, progress)

      return target > 0 && value >= target ? [getMedalKey(achievement, index + 1)] : []
    })
  })
}

/** The achievement and tier (null: no tiers) of a medal key, or null if the catalog does not have it. */
export function parseMedalKey(key: string): { achievement: Achievement; tier: number | null } | null {
  const [id, tier] = key.split('.')
  const achievement = ACHIEVEMENTS.find((candidate) => candidate.id === id)

  return achievement ? { achievement, tier: tier ? Number(tier) : null } : null
}
