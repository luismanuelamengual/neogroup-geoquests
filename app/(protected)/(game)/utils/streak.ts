import { daysBetween } from '@/app/(protected)/(game)/utils/days'

/** One streak freeze is earned every this many days of streak. */
export const STREAK_FREEZE_EVERY_DAYS = 7
/** Most streak freezes a player can keep. */
export const MAX_STREAK_FREEZES = 2

/** Days in a row with a finished game (see player_progress). */
export interface StreakState {
  currentStreak: number
  bestStreak: number
  /** Each one saves the streak from one missed day. */
  streakFreezes: number
  /** Last day with a finished game (YYYY-MM-DD) or null if none yet. */
  lastPlayedDay: string | null
}

export const EMPTY_STREAK: StreakState = { currentStreak: 0, bestStreak: 0, streakFreezes: 0, lastPlayedDay: null }

/**
 * The streak after finishing a game on `today`: the same day changes nothing,
 * the next day adds one, and a single missed day is saved by a streak freeze
 * (if the player has one); otherwise it starts again from 1. Every
 * STREAK_FREEZE_EVERY_DAYS days of streak earn a freeze (up to MAX_STREAK_FREEZES).
 */
export function extendStreak(state: StreakState, today: string): StreakState {
  const gap = state.lastPlayedDay ? daysBetween(state.lastPlayedDay, today) : null

  // Same day (or a clock going backwards, e.g. after changing the time zone): nothing changes.
  if (gap !== null && gap <= 0 && state.currentStreak > 0) {
    return state
  }

  let { streakFreezes } = state
  let currentStreak: number

  if (gap === 1) {
    currentStreak = state.currentStreak + 1
  } else if (gap === 2 && streakFreezes > 0) {
    currentStreak = state.currentStreak + 1
    streakFreezes--
  } else {
    currentStreak = 1
  }

  if (currentStreak % STREAK_FREEZE_EVERY_DAYS === 0 && streakFreezes < MAX_STREAK_FREEZES) {
    streakFreezes++
  }

  return {
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
    streakFreezes,
    lastPlayedDay: today
  }
}

/**
 * The streak as the player sees it on `today`: still alive while it can be
 * extended (played today or yesterday, or one missed day and a freeze to save
 * it); 0 once it is lost.
 */
export function getCurrentStreak(state: StreakState, today: string): number {
  if (!state.lastPlayedDay) {
    return 0
  }

  const gap = daysBetween(state.lastPlayedDay, today)

  return gap <= 1 || (gap === 2 && state.streakFreezes > 0) ? state.currentStreak : 0
}

/** The streak left by playing on each of `days` (any order, repeated days allowed). */
export function replayStreak(days: string[]): StreakState {
  return [...new Set(days)].sort().reduce(extendStreak, EMPTY_STREAK)
}
