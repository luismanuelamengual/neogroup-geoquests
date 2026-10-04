/** The detective travels to one of the destinations offered at the current stage. */
export interface TravelAction {
  type: 'travel'
  stageNumber: number
  placeId: number
}
