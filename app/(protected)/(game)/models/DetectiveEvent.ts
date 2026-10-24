/**
 * Random events of the detective mode: when the detective gets to a stage,
 * something may happen there that helps (good) or gets in the way (bad).
 * There are as many good events as bad ones in a case, though some of them
 * may change kind when they happen, to even out the case (see
 * utils/detectiveEvents.ts, where each one is described and tuned).
 */
export type DetectiveEventType =
  // ---- good ----
  /** One more witness at this stage. */
  | 'extraWitness'
  /** Some witnesses of this stage (one, two or all of them) tell two clues each (while there are clues left). */
  | 'talkative'
  /** One more trait of the thief at this stage (told by another witness). */
  | 'sharpEye'
  /** One suspect less at the end. */
  | 'suspectCleared'
  /** More time for the whole case. */
  | 'extraTime'
  /** One or two wrong destinations of this stage are ruled out as soon as the detective gets there. */
  | 'ruledOut'
  /** The witnesses of this stage cost less time. */
  | 'quickWitnesses'
  /** One more call to the central office for the rest of the case. */
  | 'extraCall'
  /** A call to the central office from this stage costs less time and may rule out more destinations. */
  | 'hotline'
  /** One more wrong destination allowed for the rest of the case. */
  | 'secondChance'
  /** The trip out of this stage is shorter. */
  | 'directFlight'
  /** The detective knows what each witness of this stage knows about (geography, customs or history). */
  | 'witnessFiles'
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
  /** The witnesses of this stage cost more time (how much more, it depends). */
  | 'slowWitnesses'
  /** The central office can not be called from this stage. */
  | 'linesDown'
  /** A call to the central office from this stage costs more time and may rule out fewer destinations. */
  | 'badSignal'
  /** One wrong destination less allowed for the rest of the case (never less than none). */
  | 'pressure'
  /** The trip out of this stage is longer. */
  | 'delayedFlight'

/**
 * An event of a stage (stored in `games.data`), with its variant. The cases
 * created before the variants existed have none: see utils/detectiveEvents.ts
 * for what each event does then.
 */
export interface DetectiveEvent {
  type: DetectiveEventType
  /**
   * `extraTime` / `lostTime`: minutes the time of the case changes (planned
   * with the case; `lostTime` may take less, it is updated when it happens).
   * `directFlight` / `delayedFlight`: minutes the trip out of the stage changes.
   */
  minutes?: number
  /** `talkative`: how many witnesses tell two clues (none: all of them). */
  witnesses?: number
  /** `ruledOut`: how many wrong destinations it rules out (set when the case is planned). */
  count?: number
  /** `ruledOut`: the wrong destinations ruled out. */
  placeIds?: number[]
  /** `ruledOut`, in the cases created before the variants: the wrong destination ruled out. */
  placeId?: number
  /** `slowWitnesses` / `hotline` / `badSignal`: what the cost of a witness or a call is multiplied by. */
  factor?: number
  /** `hotline` / `badSignal`: how many more (or, negative, fewer) destinations a call rules out. */
  eliminatesChange?: number
}
