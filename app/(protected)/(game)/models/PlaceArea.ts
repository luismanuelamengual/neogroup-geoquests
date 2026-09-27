import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** GeoJSON Polygon geometry: the first ring is the outer boundary, as [longitude, latitude] pairs. */
export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: number[][][]
}

/** Area where the locations of a place are drawn from: a circle or a polygon. */
export type PlaceArea =
  | { type: 'circle'; center: LatLng; radiusMeters: number }
  | { type: 'polygon'; center: LatLng; polygon: PolygonGeometry }
