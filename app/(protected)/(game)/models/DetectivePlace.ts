import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** A landmark of a detective game (stored in `games.data`): a stop of the route or a destination offered. */
export interface DetectivePlace extends LatLng {
  placeId: number
  placeName: string
  countryCode: string
}
