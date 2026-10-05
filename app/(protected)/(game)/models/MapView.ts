import { MapShape } from '@/app/(protected)/(game)/models/MapShape'

/** A map as shown in the map picker (second step of the main menu). */
export interface MapView {
  id: number
  /** Key of the map: its name and description are translated with it (`maps.<slug>`, see utils/mapText.ts). */
  slug: string
  /** Fixed image of the card; the photos of its collage, when it has any, are shown instead. */
  image: string | null
  /** Drawing of its area, of the maps with no image (null for the ones with image). */
  shape: MapShape | null
  /** Paths of the photos of its collage (empty: it has none, so its illustration is shown). */
  photos: string[]
  placesCount: number
}
