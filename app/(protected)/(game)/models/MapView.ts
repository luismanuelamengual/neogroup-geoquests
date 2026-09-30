/** A map as shown in the map picker (second step of the main menu). */
export interface MapView {
  id: number
  name: string
  description: string
  image: string | null
  placesCount: number
}
