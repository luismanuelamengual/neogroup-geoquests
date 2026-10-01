/**
 * Drawing of the area of a map for its card in the map picker, in the
 * coordinates of the `MAP_SHAPE_WIDTH` x `MAP_SHAPE_HEIGHT` box (see
 * utils/mapShape.ts):
 *
 *   - `outline`: the silhouette of a map that is a single area (a whole country).
 *   - `dots`: the places of a map made of many of them (cities, landmarks...).
 */
export type MapShape = { kind: 'outline'; path: string } | { kind: 'dots'; dots: [number, number][] }
