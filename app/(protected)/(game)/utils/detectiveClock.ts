import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'

const MINUTES_PER_DAY = 24 * 60

/**
 * Moment of the fictional clock of a case, `minutes` after it started (at
 * `startMinute`, minutes since Monday 0:00): "jueves 18:30" (short: "jue 18:30").
 */
export function formatCaseTime(t: Translator, startMinute: number, minutes: number, { short = false } = {}): string {
  const total = startMinute + minutes
  const day = Math.floor(total / MINUTES_PER_DAY) % 7
  const hours = Math.floor((total % MINUTES_PER_DAY) / 60)
  const mins = total % 60
  const dayName = t(`detective.days.d${day}` as MessageKey)

  return t('detective.dayTime', {
    day: short ? dayName.slice(0, 3) : dayName,
    time: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  })
}

/** A span of fictional time: "1 h", "2 h 30 min", "45 min". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins} min`
  }

  return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`
}
