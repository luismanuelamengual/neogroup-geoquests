import { describe, expect, it } from 'vitest'
import { getCountryAt, isRightCountry } from '@/app/(protected)/(game)/utils/countries'

const guess = (latitude: number, longitude: number, distanceMeters: number) => ({
  latitude,
  longitude,
  distanceMeters,
  score: 0,
  timedOut: false
})
const round = (countryCode: string, latitude: number, longitude: number) => ({
  placeName: 'Somewhere',
  countryCode,
  panoId: 'pano',
  latitude,
  longitude
})

describe('countries', () => {
  it('finds the country of a point', () => {
    expect(getCountryAt(-34.6037, -58.3816)).toBe('AR') // Buenos Aires
    expect(getCountryAt(-34.9011, -56.1645)).toBe('UY') // Montevideo
    expect(getCountryAt(48.8584, 2.2945)).toBe('FR') // Paris
    expect(getCountryAt(41.8781, -87.6298)).toBe('US') // Chicago
    expect(getCountryAt(35.6762, 139.6503)).toBe('JP') // Tokyo
    expect(getCountryAt(-33.9249, 18.4241)).toBe('ZA') // Cape Town
    expect(getCountryAt(0, -30)).toBeNull() // The Atlantic
  })

  it('tells whether a guess fell in the country of its round', () => {
    const iguazu = round('AR', -25.6953, -54.4367)

    expect(isRightCountry(guess(-26.8241, -65.2226, 900000), iguazu)).toBe(true) // Tucumán
    expect(isRightCountry(guess(-23.5505, -46.6333, 1000000), iguazu)).toBe(false) // São Paulo, Brazil
    // Close to the round, wherever the pin is: the borders are coarse (here, in the water of the Río de la Plata).
    expect(isRightCountry(guess(-34.7, -58.1, 20000), round('AR', -34.6037, -58.3816))).toBe(true)
    expect(isRightCountry(guess(41.9022, 12.4539, 300), round('VA', 41.9022, 12.4539))).toBe(true) // The Vatican
    expect(isRightCountry(guess(0, -30, 3000000), iguazu)).toBe(false)
    expect(isRightCountry(null, iguazu)).toBe(false)
    expect(isRightCountry({ ...guess(0, 0, 0), latitude: null, longitude: null, distanceMeters: null }, iguazu)).toBe(
      false
    )
  })
})
