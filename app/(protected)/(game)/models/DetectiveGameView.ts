import { DetectiveOutcome } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'
import { DetectiveTravel } from '@/app/(protected)/(game)/models/DetectiveTravel'
import { LocalizedText } from '@/app/(protected)/(game)/models/LandmarkClues'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'

/** A witness as the player sees it: its clue only once the detective talked to it. */
export interface DetectiveWitnessView {
  seed: number
  role: WitnessRole
  asked: boolean
  clue: LocalizedText | null
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
  stagesCount: number
  /** Null once the case is closed. */
  currentStageNumber: number | null
  elapsedMinutes: number
  timeLimitMinutes: number
  /** Minutes of fictional time each witness costs. */
  witnessMinutes: number
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
  /** Null once the case is closed. */
  currentStage: DetectiveCurrentStageView | null
  playedStages: DetectivePlayedStageView[]
  /** The whole route of the suspect (crime scene first): only once the case is closed. */
  route: DetectivePlace[] | null
}
