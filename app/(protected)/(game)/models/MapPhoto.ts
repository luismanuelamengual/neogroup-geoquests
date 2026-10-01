/** A real photo of the collage of a map card (taken from Wikimedia Commons, see scripts/fetch-map-photos.ts). */
export interface MapPhoto {
  /** Path of the optimized copy, under /public. */
  src: string
  /** Title of the file in Wikimedia Commons. */
  title: string
  /** Author, as credited by Wikimedia Commons (plain text). */
  author: string
  /** Short license name, e.g. "CC BY-SA 4.0". */
  license: string
  /** Page of the file in Wikimedia Commons (credits). */
  url: string
}
