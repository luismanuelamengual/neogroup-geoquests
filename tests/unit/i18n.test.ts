import { describe, expect, it } from 'vitest'
import { formatPosition } from '@/app/(protected)/(game)/utils/players'
import { formatDistance, formatScore, formatTimeLimit, getRoundVerdict } from '@/app/(protected)/(game)/utils/score'
import { DEFAULT_LOCALE, isLocale, LOCALES, matchLocale } from '@/app/i18n/config'
import { getMessages } from '@/app/i18n/messages'
import { createTranslator } from '@/app/i18n/translate'
import { ApiException } from '@/app/models/ApiException'

/** Dotted paths of every message of a dictionary (plural messages are leaves). */
function collectKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') {
    return [prefix]
  }

  const record = node as Record<string, unknown>

  if ('other' in record && typeof record.other === 'string') {
    return [prefix]
  }

  return Object.entries(record).flatMap(([key, value]) => collectKeys(value, prefix ? `${prefix}.${key}` : key))
}

describe('dictionaries', () => {
  it('have the same keys in every language', () => {
    const reference = collectKeys(getMessages(DEFAULT_LOCALE)).sort()

    for (const locale of LOCALES) {
      expect(collectKeys(getMessages(locale)).sort(), locale).toEqual(reference)
    }
  })

  it('use the same placeholders in every language', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
    const es = createTranslator('es')
    const en = createTranslator('en')

    for (const key of collectKeys(getMessages('es'))) {
      const params = { count: 2 }
      const spanish = es(key as never, params)
      const english = en(key as never, params)

      expect(placeholders(english), key).toEqual(placeholders(spanish))
    }
  })
})

describe('translator', () => {
  it('replaces placeholders', () => {
    expect(createTranslator('en')('home.greeting', { name: 'Ana' })).toBe('Hi, Ana!')
    expect(createTranslator('es')('home.greeting', { name: 'Ana' })).toBe('¡Hola, Ana!')
  })

  it('chooses the plural form with count', () => {
    expect(createTranslator('en')('picker.places', { count: 1 })).toBe('1 place')
    expect(createTranslator('en')('picker.places', { count: 5 })).toBe('5 places')
    expect(createTranslator('es')('picker.places', { count: 1 })).toBe('1 lugar')
    expect(createTranslator('es')('picker.places', { count: 5 })).toBe('5 lugares')
  })

  it('returns the key of an unknown message', () => {
    expect(createTranslator('en')('nope.missing' as never)).toBe('nope.missing')
  })
})

describe('languages', () => {
  it('recognizes the supported ones', () => {
    expect(isLocale('es')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })

  it('matches the Accept-Language header', () => {
    expect(matchLocale('en-US,en;q=0.9,es;q=0.8')).toBe('en')
    expect(matchLocale('es-AR,es;q=0.9')).toBe('es')
    expect(matchLocale('fr-FR,fr;q=0.9,en;q=0.5')).toBe('en')
    expect(matchLocale('fr-FR')).toBeNull()
    expect(matchLocale(null)).toBeNull()
  })
})

describe('localized formats', () => {
  it('formats numbers with the separators of the language', () => {
    expect(formatScore(12345, 'en')).toBe('12,345')
    expect(formatScore(12345, 'es')).toBe('12.345')
    expect(formatDistance(1234, 'en')).toBe('1.2 km')
    expect(formatDistance(1234, 'es')).toBe('1,2 km')
  })

  it('writes ordinals and time limits in the language', () => {
    expect(formatPosition(1, 'es')).toBe('1.º')
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map((position) => formatPosition(position, 'en'))).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd'
    ])
    expect(formatTimeLimit(90, createTranslator('en'))).toBe('1 min 30 s')
    expect(getRoundVerdict(5000, 5000, createTranslator('en'))).toBe('PERFECT!')
    expect(getRoundVerdict(5000, 5000)).toBe('¡PERFECTO!')
  })
})

describe('ApiException', () => {
  it('keeps the Spanish text as its message and the key and params for translating it', () => {
    const error = new ApiException('errors.notEnoughPlayers', 400, { minPlayers: 3 })

    expect(error.message).toBe('Hacen falta al menos 3 jugadores para empezar')
    expect(error.messageKey).toBe('errors.notEnoughPlayers')
    expect(createTranslator('en')(error.messageKey, error.params)).toBe('At least 3 players are needed to start')
  })
})
