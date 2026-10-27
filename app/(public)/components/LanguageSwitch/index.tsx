'use client'

import './index.scss'
import { useRouter } from 'next/navigation'
import { ChangeEvent } from 'react'
import { isLocale, Locale, LOCALE_COOKIE, LOCALE_FLAGS, LOCALE_NAMES, LOCALES } from '@/app/i18n/config'

/** One year, in seconds. */
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60

/**
 * Language selector of the public pages, for signed-out visitors: it saves the
 * language in the `locale` cookie (see detectLocale) and renders the page again.
 */
export default function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (!isLocale(value)) {
      return
    }

    document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
    router.refresh()
  }

  return (
    <select className="language-switch" value={locale} onChange={handleChange} aria-label={label}>
      {LOCALES.map((option) => (
        <option key={option} value={option}>
          {LOCALE_FLAGS[option]} {LOCALE_NAMES[option]}
        </option>
      ))}
    </select>
  )
}
