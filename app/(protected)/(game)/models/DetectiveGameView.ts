import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { DetectiveOutcome } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveTravel } from '@/app/(protected)/(game)/models/DetectiveTravel'
import { LocalizedText } from '@/app/(protected)/(game)/models/LandmarkClues'
import { SuspectClue } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'

/** A witness as the player sees it: its clue only once the detective talked to it. */
export interface DetectiveWitnessView {
  seed: number
  role: WitnessRole
  asked: boolean
  clue: LocalizedText | null
  /** Trait of the thief this witness told (it tells it together with its clue); null when it has none or was not asked. */
  suspectClue: SuspectClue | null
}

/** The stage being played: never its answer. */
export interface DetectiveCurrentStageView {
  stageNumber: number
  /** Where the detective is now (the crime scene or the previous stop). */
  location: DetectivePlace
  /** Street View panorama of `location`: where the detective is (never the destination). */
  panoId: string
  witnesses: DetectiveWitnessView[]
  options: DetectivePlace[]
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
  /** Minutes of fictional time each witness costs. */
  witnessMinutes: number
  /** Suspects offered at the last stop (0 in the cases created before they existed). */
  suspectsCount: number
  /** Wrong destinations so far. */
  mistakes: number
  /** Wrong destinations allowed: one more and the trail is lost. */
  maxMistakes: number
  outcome: DetectiveOutcome | null
  score: number
  maxScore: number
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
