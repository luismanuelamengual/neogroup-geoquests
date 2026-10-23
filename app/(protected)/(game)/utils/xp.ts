import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'

/**
 * Experience (XP) and levels of the players: every finished game gives XP
 * (even a bad one), and the total XP makes the level, on a curve where each
 * level takes a bit longer than the one before (see getLevelStartXp).
 */

/** XP for finishing a game, of any mode. */
export const XP_FOR_FINISHING = 20
/** Points of score that make 1 XP (modes with a score: all but detective). */
export const SCORE_PER_XP = 100
/** Extra XP of the daily challenge. */
export const XP_DAILY_CHALLENGE_BONUS = 50
/** Extra XP of the first game finished on a day (the player's day, like the streak). */
export const XP_FIRST_GAME_OF_DAY_BONUS = 30
/** Extra XP of the 1st, 2nd and 3rd places of a game with 2 or more players. */
export const XP_PODIUM_BONUS = [50, 30, 15]
/** XP of a solved detective case, by difficulty. */
export const XP_CASE_SOLVED: Record<DetectiveDifficulty, number> = { easy: 100, medium: 150, hard: 200 }

/** XP to go from level 1 to level 2; each level after it takes XP_LEVEL_STEP more. */
export const XP_FIRST_LEVEL = 200
export const XP_LEVEL_STEP = 100

/** Ranks of the levels: each one from its `minLevel` up to the next one's (names in i18n, `xp.ranks.<key>`). */
export const XP_RANKS = [
  { minLevel: 1, key: 'tourist' },
  { minLevel: 5, key: 'backpacker' },
  { minLevel: 10, key: 'explorer' },
  { minLevel: 20, key: 'cartographer' },
  { minLevel: 35, key: 'navigator' },
  { minLevel: 50, key: 'legend' }
] as const

export type XpRank = (typeof XP_RANKS)[number]['key']

/** What a finished game gives XP for (one player's). */
export interface GameXpInput {
  mode: GameMode
  score: number
  position: number | null
  outcome: GameOutcome | null
  /** Players with a result in the game (the podium bonus needs 2 or more). */
  playersCount: number
  /** The game is a daily challenge attempt. */
  isDailyChallenge: boolean
  /** The first game the player finished on its day. */
  isFirstGameOfDay: boolean
  /** Detective cases only. */
  difficulty?: DetectiveDifficulty | null
}

/** Where a player is in the levels. */
export interface LevelProgress {
  level: number
  rank: XpRank
  /** XP gathered inside the current level. */
  levelXp: number
  /** XP the current level takes (from its start to the next level). */
  nextLevelXp: number
}

/** XP a finished game gives a player. */
export function getGameXp(input: GameXpInput): number {
  let xp = XP_FOR_FINISHING

  if (input.mode === GameMode.DETECTIVE) {
    if (input.outcome === GameOutcome.WON) {
      xp += XP_CASE_SOLVED[input.difficulty ?? 'easy'] ?? XP_CASE_SOLVED.easy
    }
  } else {
    xp += Math.floor(Math.max(0, input.score) / SCORE_PER_XP)
  }

  if (input.playersCount >= 2 && input.position !== null && input.position >= 1) {
    xp += XP_PODIUM_BONUS[input.position - 1] ?? 0
  }

  if (input.isDailyChallenge) {
    xp += XP_DAILY_CHALLENGE_BONUS
  }

  if (input.isFirstGameOfDay) {
    xp += XP_FIRST_GAME_OF_DAY_BONUS
  }

  return xp
}

/**
 * Total XP to reach `level` (level 1: 0). Going from level n to n+1 takes
 * XP_FIRST_LEVEL + XP_LEVEL_STEP·(n−1), so:
 *
 *   XP(n) = XP_FIRST_LEVEL·(n−1) + XP_LEVEL_STEP·(n−1)·(n−2)/2
 */
export function getLevelStartXp(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1

  return XP_FIRST_LEVEL * n + (XP_LEVEL_STEP * n * (n - 1)) / 2
}

/** Level of a player with `xp` total XP. */
export function getLevel(xp: number): number {
  let level = 1

  while (getLevelStartXp(level + 1) <= xp) {
    level++
  }

  return level
}

/** Rank of a level. */
export function getRank(level: number): XpRank {
  return [...XP_RANKS].reverse().find((rank) => level >= rank.minLevel)!.key
}

/** Level, rank and progress inside the level of a player with `xp` total XP. */
export function getLevelProgress(xp: number): LevelProgress {
  const total = Math.max(0, Math.floor(xp))
  const level = getLevel(total)
  const start = getLevelStartXp(level)

  return {
    level,
    rank: getRank(level),
    levelXp: total - start,
    nextLevelXp: getLevelStartXp(level + 1) - start
  }
}
