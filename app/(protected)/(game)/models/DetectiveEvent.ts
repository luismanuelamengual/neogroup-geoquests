/**
 * Random events of the detective mode: when the detective gets to a stage,
 * something may happen there that helps (good) or gets in the way (bad).
 * There are as many good events as bad ones in a case (see
 * utils/detectiveEvents.ts, where each one is described and tuned).
 */
export type DetectiveEventType =
  // ---- good ----
  /** One more witness at this stage. */
  | 'extraWitness'
  /** The witnesses of this stage tell two clues each (while there are clues left). */
  | 'talkative'
  /** One more trait of the thief at this stage (told by another witness). */
  | 'sharpEye'
  /** One suspect less at the end. */
  | 'suspectCleared'
  /** More time for the whole case. */
  | 'extraTime'
  /** A wrong destination of this stage is ruled out as soon as the detective gets there. */
  | 'ruledOut'
  /** The witnesses of this stage cost less time. */
  | 'quickWitnesses'
  /** One more call to the central office for the rest of the case. */
  | 'extraCall'
  /** A call to the central office from this stage costs less time and rules out one more destination. */
  | 'hotline'
  /** One more wrong destination allowed for the rest of the case. */
  | 'secondChance'
  /** The trip out of this stage is shorter. */
  | 'directFlight'
  // ---- bad ----
  /** One witness less at this stage (never less than one). */
  | 'missingWitness'
  /** Nobody at this stage saw the face of the thief: no trait of it here. */
  | 'noSighting'
  /** One more suspect at the end. */
  | 'accomplice'
  /** Less time for the whole case (never so much that it ends the case right there). */
  | 'lostTime'
  /** One more destination to choose from at this stage. */
  | 'moreRumors'
  /** The witnesses of this stage cost more time. */
  | 'slowWitnesses'
  /** The central office can not be called from this stage. */
  | 'linesDown'
  /** A call to the central office from this stage costs more time and rules out one destination less. */
  | 'badSignal'
  /** One wrong destination less allowed for the rest of the case (never less than none). */
  | 'pressure'
  /** The trip out of this stage is longer. */
  | 'delayedFlight'

/** An event of a stage (stored in `games.data`). */
export interface DetectiveEvent {
  type: DetectiveEventType
  /**
   * `extraTime` / `lostTime`: minutes the time of the case changes (planned
   * with the case; `lostTime` may take less, it is updated when it happens).
   */
  minutes?: number
  /** `ruledOut`: the wrong destination ruled out. */
  placeId?: number
}
