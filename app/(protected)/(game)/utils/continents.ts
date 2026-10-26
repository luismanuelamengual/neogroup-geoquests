/**
 * Continents of the countries (ISO 3166-1 alpha-2) of the places of the maps,
 * for the "six continents" achievement (see utils/achievements.ts). Central
 * America and the Caribbean count as North America; Turkey and Russia, as Europe.
 */
export const CONTINENTS = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania'] as const

export type Continent = (typeof CONTINENTS)[number]

const COUNTRIES: Record<Continent, string[]> = {
  africa: ['ZA', 'SN', 'TN', 'GH', 'EG', 'MA', 'KE', 'TZ', 'NA'],
  asia: [
    'JP',
    'IN',
    'KR',
    'ID',
    'AE',
    'TW',
    'TH',
    'MY',
    'LK',
    'SG',
    'JO',
    'IL',
    'HK',
    'VN',
    'MN',
    'KH',
    'PH',
    'MO',
    'CN'
  ],
  europe: [
    'ES',
    'IT',
    'GB',
    'FR',
    'DE',
    'PT',
    'GR',
    'IS',
    'TR',
    'IE',
    'NO',
    'AT',
    'PL',
    'NL',
    'CH',
    'RO',
    'HU',
    'HR',
    'CZ',
    'BE',
    'SI',
    'SE',
    'RU',
    'FI',
    'DK',
    'RS',
    'MT',
    'LT',
    'BG',
    'BA',
    'VA',
    'SM',
    'SK',
    'ME',
    'MC',
    'LV',
    'LU',
    'LI',
    'GI',
    'FO',
    'EE',
    'AD',
    'AL',
    'CY',
    'MK',
    'MD',
    'UA',
    'BY',
    'XK'
  ],
  northAmerica: ['US', 'MX', 'CA', 'PA', 'GT', 'PR', 'DO', 'CR', 'CU', 'HN', 'SV', 'NI', 'BZ', 'JM', 'BS'],
  southAmerica: ['AR', 'BR', 'CO', 'PE', 'CL', 'EC', 'BO', 'UY', 'PY', 'VE'],
  oceania: ['AU', 'NZ']
}
const CONTINENT_OF = new Map(
  (Object.entries(COUNTRIES) as [Continent, string[]][]).flatMap(([continent, countries]) =>
    countries.map((country) => [country, continent] as const)
  )
)

/** Continent of a country, or null if it is not in the list. */
export function getContinent(countryCode: string | null | undefined): Continent | null {
  return countryCode ? (CONTINENT_OF.get(countryCode.toUpperCase()) ?? null) : null
}
