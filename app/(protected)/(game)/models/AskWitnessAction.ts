/** The detective talks to a witness of the current stage (it costs fictional time; asking again is free). */
export interface AskWitnessAction {
  type: 'askWitness'
  stageNumber: number
  /** Index of the witness in the stage. */
  witness: number
}
