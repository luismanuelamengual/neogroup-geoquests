import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, getDayKey, getNextDayStart, isValidTimeZone } from '@/app/(protected)/(game)/utils/days'
import {
  EMPTY_STREAK,
  extendStreak,
  getCurrentStreak,
  MAX_STREAK_FREEZES,
  replayStreak
} from '@/app/(protected)/(game)/utils/streak'

describe('days', () => {
  it('gives the day of a date in a time zone (UTC by default)', () => {
    const date = new Date('2026-03-02T01:00:00Z')

    expect(getDayKey(date)).toBe('2026-03-02')
    expect(getDayKey(date, 'America/Argentina/Buenos_Aires')).toBe('2026-03-01')
    expect(getDayKey(date, 'Not/AZone')).toBe('2026-03-02')
  })

  it('counts and adds days', () => {
    expect(daysBetween('2026-02-27', '2026-03-02')).toBe(3)
    expect(daysBetween('2026-03-02', '2026-03-01')).toBe(-1)
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('gives when the next day starts in a time zone (UTC by default)', () => {
    expect(getNextDayStart(new Date('2026-03-02T23:59:00Z')).toISOString()).toBe('2026-03-03T00:00:00.000Z')
    // 21:05 of the 21st in Buenos Aires (UTC-3) is 00:05 of the 22nd in UTC: its next day starts at 03:00 UTC.
    expect(getNextDayStart(new Date('2026-10-22T00:05:00Z'), 'America/Argentina/Buenos_Aires').toISOString()).toBe(
      '2026-10-22T03:00:00.000Z'
    )
    expect(getNextDayStart(new Date('2026-03-02T10:00:00Z'), 'Asia/Tokyo').toISOString()).toBe(
      '2026-03-02T15:00:00.000Z'
    )
    // The day before daylight saving time ends has 25 hours (Madrid: UTC+2 → UTC+1 on 2026-10-25).
    expect(getNextDayStart(new Date('2026-10-24T23:00:00Z'), 'Europe/Madrid').toISOString()).toBe(
      '2026-10-25T23:00:00.000Z'
    )
    expect(getNextDayStart(new Date('2026-03-28T12:00:00Z'), 'Europe/Madrid').toISOString()).toBe(
      '2026-03-28T23:00:00.000Z'
    )
  })

  it('validates time zones', () => {
    expect(isValidTimeZone('Europe/Madrid')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus')).toBe(false)
    expect(isValidTimeZone(42)).toBe(false)
  })
})

describe('streak', () => {
  it('starts at 1, does not change the same day and grows the next one', () => {
    const first = extendStreak(EMPTY_STREAK, '2026-03-01')

    expect(first).toEqual({ currentStreak: 1, bestStreak: 1, streakFreezes: 0, lastPlayedDay: '2026-03-01' })
    expect(extendStreak(first, '2026-03-01')).toBe(first)
    expect(extendStreak(first, '2026-03-02')).toMatchObject({ currentStreak: 2, bestStreak: 2 })
  })

  it('starts again after a missed day without freezes, keeping the best', () => {
    const streak = replayStreak(['2026-03-01', '2026-03-02', '2026-03-03'])

    expect(extendStreak(streak, '2026-03-05')).toMatchObject({ currentStreak: 1, bestStreak: 3 })
  })

  it('earns freezes every 7 days (up to the maximum) and uses one for a missed day', () => {
    const days = Array.from({ length: 21 }, (_, index) => addDays('2026-03-01', index))
    const streak = replayStreak(days)

    expect(streak).toMatchObject({ currentStreak: 21, streakFreezes: MAX_STREAK_FREEZES })
    expect(extendStreak(streak, addDays(streak.lastPlayedDay!, 2))).toMatchObject({
      currentStreak: 22,
      streakFreezes: MAX_STREAK_FREEZES - 1
    })
    // Two missed days are too many even with freezes.
    expect(extendStreak(streak, addDays(streak.lastPlayedDay!, 3))).toMatchObject({ currentStreak: 1 })
  })

  it('shows the streak while it can still be extended', () => {
    const streak = replayStreak(['2026-03-01', '2026-03-02'])

    expect(getCurrentStreak(streak, '2026-03-02')).toBe(2)
    expect(getCurrentStreak(streak, '2026-03-03')).toBe(2)
    expect(getCurrentStreak(streak, '2026-03-04')).toBe(0)
    expect(getCurrentStreak({ ...streak, streakFreezes: 1 }, '2026-03-04')).toBe(2)
    expect(getCurrentStreak(EMPTY_STREAK, '2026-03-04')).toBe(0)
  })
})
