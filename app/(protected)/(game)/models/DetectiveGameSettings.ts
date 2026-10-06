import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { DetectiveDifficultySettings } from '@/app/(protected)/(game)/models/DetectiveDifficultySettings'

/**
 * Settings of a detective game (stored in `games.data`): the difficulty the
 * player chose and the rules of that difficulty as they were when the case
 * was created, so retuning a difficulty never changes a case in progress.
 */
export interface DetectiveGameSettings extends DetectiveDifficultySettings {
  difficulty: DetectiveDifficulty
}
