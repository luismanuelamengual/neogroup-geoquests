/**
 * Geometry of a place — the area its locations are drawn from — stored as a
 * GeoJSON geometry object (RFC 7946) in the `places.geometry` column.
 * Coordinates are always [longitude, latitude].
 *
 * GeoJSON has no circle type, so a circle is written the usual way: a `Point`
 * (its center) plus a `radius` member in meters. RFC 7946 §6.1 allows such
 * extra ("foreign") members; any GeoJSON tool still reads it as a valid Point.
 *
 *   { "type": "Point", "coordinates": [-68.8458, -32.8895], "radius": 5000 }
 *   { "type": "Polygon", "coordinates": [[[lng, lat], [lng, lat], ..., [lng, lat]]] }
 *
 * To support a new kind of area, add its type to the `PlaceGeometry` union and
 * handle it in app/(protected)/(game)/utils/geo.ts (randomPointInGeometry and
 * isPointInGeometry).
 */

/** Circle: GeoJSON Point (center) + `radius` in meters. */
export interface CircleGeometry {
  type: 'Point'
  coordinates: [number, number]
  radius: number
}

/** GeoJSON Polygon: the first ring is the outer boundary, the others are holes. */
export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: number[][][]
}

export type PlaceGeometry = CircleGeometry | PolygonGeometry

export function isCircleGeometry(geometry: PlaceGeometry): geometry is CircleGeometry {
  return geometry.type === 'Point'
}
