import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'

/**
 * Rules of a game mode that the player can choose when creating a game, with
 * the values allowed for each one. A missing field cannot be changed: the
 * default of the mode (GameModeDefinition.settings) is used.
 */
export interface GameSettingsOptions {
  rounds?: number[]
  /** Time limit of each round in seconds (null = no limit). */
  timeLimitSeconds?: (number | null)[]
  /** Rounds played between one elimination and the next (battle royale mode). */
  roundsPerElimination?: number[]
  /** Difficulties a case can have (detective mode). */
  difficulty?: DetectiveDifficulty[]
}
