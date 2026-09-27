import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlaceArea } from '@/app/(protected)/(game)/models/PlaceArea'

/** Area of a place: its polygon when it has one, the circle otherwise. */
export function getPlaceArea(place: Pick<Place, 'latitude' | 'longitude' | 'radiusMeters' | 'polygon'>): PlaceArea {
  const center = { latitude: place.latitude, longitude: place.longitude }

  if (place.polygon?.coordinates?.[0]?.length) {
    return { type: 'polygon', center, polygon: place.polygon }
  }

  if (place.radiusMeters && place.radiusMeters > 0) {
    return { type: 'circle', center, radiusMeters: place.radiusMeters }
  }

  throw new Error('A place needs either a polygon or a positive radius')
}

/** Flag emoji of an ISO 3166-1 alpha-2 country code ("AR" → 🇦🇷). */
export function countryFlag(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🏳️'
  }

  return String.fromCodePoint(...Array.from(countryCode.toUpperCase()).map((char) => 127397 + char.charCodeAt(0)))
}
