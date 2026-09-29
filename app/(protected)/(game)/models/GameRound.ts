/** A round of a round based game (stored in `games.data`): where it is and the panorama to show. */
export interface GameRound {
  placeName: string
  countryCode: string
  /** Google Street View panorama of the round. */
  panoId: string
  latitude: number
  longitude: number
}
