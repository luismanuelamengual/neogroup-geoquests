import { MapillaryProvider } from '@/app/(protected)/(game)/services/imagery/MapillaryProvider'
import { StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import { ApiException } from '@/app/models/ApiException'

let provider: StreetImageryProvider | null = null

/** The street imagery provider configured for this deploy (Mapillary for now). */
export function getStreetImageryProvider(): StreetImageryProvider {
  if (!provider) {
    const accessToken = process.env.MAPILLARY_ACCESS_TOKEN

    if (!accessToken) {
      throw new ApiException('Falta configurar MAPILLARY_ACCESS_TOKEN en el servidor', 500)
    }

    provider = new MapillaryProvider(accessToken)
  }

  return provider
}
