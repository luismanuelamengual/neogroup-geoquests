import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { DetectiveEventType } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectiveOutcome } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveTravel } from '@/app/(protected)/(game)/models/DetectiveTravel'
import { LocalizedText } from '@/app/(protected)/(game)/models/LandmarkClues'
import { SuspectClue } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'

/** A witness as the player sees it: its clues only once the detective talked to it. */
export interface DetectiveWitnessView {
  seed: number
  role: WitnessRole
  asked: boolean
  /** Clues of the destination it told (the first one, of the kind its job knows about): empty until asked. */
  clues: LocalizedText[]
  /** Trait of the thief this witness told (it tells it together with its clue); null when it has none or was not asked. */
  suspectClue: SuspectClue | null
}

/** An event of a stage, as the player sees it (only once the detective got to its stage). */
export interface DetectiveEventView {
  type: DetectiveEventType
  good: boolean
  /** `extraTime` / `lostTime`: the minutes the time of the case changed. */
  minutes?: number
  /** `ruledOut`: the wrong destination ruled out (it is one of the options of the stage). */
  placeId?: number
}

/** A call to the central office from the current stage. */
export interface DetectiveCallView {
  /** Calls left in the case. */
  left: number
  /** Whether the central office can be called from this stage (an event may cut the lines). */
  available: boolean
  /** What a call costs from this stage. */
  minutes: number
  /** Wrong destinations a call rules out from this stage (at most all but one of those left). */
  eliminates: number
}

/** The stage being played: never its answer. */
export interface DetectiveCurrentStageView {
  stageNumber: number
  /** Where the detective is now (the crime scene or the previous stop). */
  location: DetectivePlace
  /** Street View panorama of `location`: where the detective is (never the destination). */
  panoId: string
  witnesses: DetectiveWitnessView[]
  /** Minutes each witness of this stage costs (an event may change it). */
  witnessMinutes: number
  options: DetectivePlace[]
  /** Destinations ruled out (ids): the detective can not travel there. */
  eliminated: number[]
  /** Minutes the events of this stage add to (or take from) the trip out of it. */
  flightMinutes: number
  /** What happened when the detective got here. */
  events: DetectiveEventView[]
  call: DetectiveCallView
}

/** The suspects of the last stop, among which the detective has to point at the thief. */
export interface DetectiveLineupView {
  /** Where the detective is: the last stop of the route. */
  location: DetectivePlace
  /** Street View panorama of `location`. */
  panoId: string
  /** Seeds of the suspects (their look), in order. */
  suspects: number[]
  /** Index of the thief and of the suspect accused: only once the detective accused (the case is closed). */
  thief: number | null
  accused: number | null
}

/** A stage already played: its answer and the trip of the detective. */
export interface DetectivePlayedStageView {
  stageNumber: number
  from: DetectivePlace
  destination: DetectivePlace
  chosen: DetectivePlace
  travel: DetectiveTravel
  /** Witnesses the detective talked to. */
  askedWitnesses: number
  /** Calls to the central office made from this stage. */
  calls: number
  events: DetectiveEventView[]
}

/** Client view of a detective game (GameView.modeView). */
export interface DetectiveGameView {
  difficulty: DetectiveDifficulty
  stagesCount: number
  /** Null once the case is closed, or while the detective has to point at the thief (see `lineup`). */
  currentStageNumber: number | null
  /** Moment the fictional clock started: minutes since Monday 0:00. */
  startMinute: number
  elapsedMinutes: number
  timeLimitMinutes: number
  /** Minutes of fictional time each witness usually costs (at the current stage, see currentStage.witnessMinutes). */
  witnessMinutes: number
  /** Suspects offered at the last stop, as far as the detective knows (0 in the cases created before they existed). */
  suspectsCount: number
  /** Wrong destinations so far. */
  mistakes: number
  /** Wrong destinations allowed (events may change it): one more and the trail is lost. */
  maxMistakes: number
  /** Destinations usually offered at each stage (events may add one). */
  optionsCount: number
  /** Calls to the central office the case started with, what each one usually costs and how many destinations it rules out. */
  centralCalls: number
  centralCallMinutes: number
  centralCallEliminates: number
  outcome: DetectiveOutcome | null
  /** What was stolen (index of the loot texts: detective.loot.loot{n + 1}). */
  loot: number
  /** Crime scene. */
  origin: DetectivePlace
  /** Null once the case is closed, or while the detective has to point at the thief (see `lineup`). */
  currentStage: DetectiveCurrentStageView | null
  playedStages: DetectivePlayedStageView[]
  /** The suspects of the last stop: from the moment the detective gets there (null before, or if the case ended before). */
  lineup: DetectiveLineupView | null
  /** The whole route of the suspect (crime scene first): only once the case is closed. */
  route: DetectivePlace[] | null
}
