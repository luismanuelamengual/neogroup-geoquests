/** The trip the detective chose at a stage (stored in `games.data`). */
export interface DetectiveTravel {
  /** Destination chosen (one of the options of the stage). */
  placeId: number
  correct: boolean
  /** Minutes of the trip to the chosen destination. */
  travelMinutes: number
  /** Wrong destination: minutes of the extra trip from there to the right one (0 when correct). */
  redirectMinutes: number
}
