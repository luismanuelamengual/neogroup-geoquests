/**
 * Calendar days as 'YYYY-MM-DD' keys, in the player's time zone: the streak
 * and the daily challenge change at the player's midnight (like Wordle).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Whether `timeZone` is an IANA time zone this runtime knows (e.g. 'America/Argentina/Buenos_Aires'). */
export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== 'string' || timeZone.length === 0 || timeZone.length > 64) {
    return false
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone })

    return true
  } catch {
    return false
  }
}

/** The day `date` falls on in `timeZone` (UTC when missing or unknown). */
export function getDayKey(date: Date, timeZone?: string | null): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: isValidTimeZone(timeZone) ? timeZone : 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const part = (type: string) => parts.find((item) => item.type === type)!.value

  return `${part('year')}-${part('month')}-${part('day')}`
}

function toUtcMs(day: string): number {
  const [year, month, date] = day.split('-').map(Number)

  return Date.UTC(year, month - 1, date)
}

/** Whole days from `from` to `to` (negative when `to` is before). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY)
}

/** The day `days` after `day` (before, when negative). */
export function addDays(day: string, days: number): string {
  return new Date(toUtcMs(day) + days * MS_PER_DAY).toISOString().slice(0, 10)
}

/** Milliseconds `timeZone` is ahead of UTC at `date` (e.g. -3 h in Buenos Aires). */
function getOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).formatToParts(date)
  const part = (type: string) => Number(parts.find((item) => item.type === type)!.value)
  const local = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'))

  return local - Math.floor(date.getTime() / 1000) * 1000
}

/** When the day after the one of `date` starts in `timeZone` (UTC when missing or unknown): the next daily challenge. */
export function getNextDayStart(date: Date, timeZone?: string | null): Date {
  const zone = isValidTimeZone(timeZone) ? timeZone : 'UTC'
  const midnight = toUtcMs(addDays(getDayKey(date, zone), 1))
  // The offset at that midnight, which may differ from today's (daylight saving time).
  const guess = midnight - getOffsetMs(new Date(midnight), zone)

  return new Date(midnight - getOffsetMs(new Date(guess), zone))
}
