/**
 * Base map configuration. Tiles come from OpenFreeMap (https://openfreemap.org):
 * free OpenStreetMap vector tiles with no API key and no usage limits.
 * Rendered with MapLibre GL (open source).
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

/** Initial view of the guess map: the whole world. */
export const WORLD_VIEW = { center: [10, 25] as [number, number], zoom: 1 }
