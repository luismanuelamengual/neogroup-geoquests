import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'

/**
 * Rules chosen by the player when creating a game (part of /api/createGame).
 * Every field is optional: a missing or not allowed value falls back to the
 * default of the mode (see GameModeDefinition.configurable).
 */
export interface GameSettingsInput {
  rounds?: number
  /** Time limit of each round in seconds (null = no limit, only where the mode allows it). */
  timeLimitSeconds?: number | null
  /** Rounds played between one elimination and the next (battle royale mode). */
  roundsPerElimination?: number
  /** Difficulty of a case (detective mode). */
  difficulty?: DetectiveDifficulty
}
