/**
 * The detective calls the central office from the current stage: it costs
 * fictional time and the central rules out some of the wrong destinations
 * (see centralCalls, centralCallMinutes and centralCallEliminates in DetectiveDifficultySettings).
 */
export interface CallCentralAction {
  type: 'callCentral'
  stageNumber: number
}
