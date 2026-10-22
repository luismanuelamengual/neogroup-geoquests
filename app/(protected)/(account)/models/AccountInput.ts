import type { Locale } from '@/app/i18n/config'

/** Payload of /api/updateAccount: the fields to change (at least one). */
export interface AccountInput {
  name?: string
  /** '' clears it. */
  lastName?: string
  /** '' clears it (the name and last name are shown again). */
  nickname?: string
  locale?: Locale
  /** IANA time zone of the browser (the day of the streak); sent on its own, see TimeZoneSync. */
  timeZone?: string
}
