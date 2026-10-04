/** Settings of a detective game: fixed rules (the player chooses none of them). */
export interface DetectiveGameSettings {
  /** Places the suspect travels to after the crime scene (the case ends when the detective reaches the last one). */
  hops: number
  /** Destinations offered to the detective at each stage (the right one and decoys). */
  options: number
  /** Witnesses at each stage: each one knows one clue about the next destination. */
  witnesses: number
  /** Shortest distance (km) between two consecutive places of the route. */
  minHopKm: number
}
