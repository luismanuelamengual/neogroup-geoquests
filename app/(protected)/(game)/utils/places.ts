/** Flag emoji of an ISO 3166-1 alpha-2 country code ("AR" → 🇦🇷). */
export function countryFlag(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🏳️'
  }

  return String.fromCodePoint(...Array.from(countryCode.toUpperCase()).map((char) => 127397 + char.charCodeAt(0)))
}
