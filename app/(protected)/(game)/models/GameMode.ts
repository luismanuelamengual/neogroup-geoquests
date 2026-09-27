/** Game modes (stored as INTEGER in `places.mode` and `games.mode`). */
export enum GameMode {
  WORLD_CITIES = 1
}

/** Scoring curve of a mode — see app/(protected)/(game)/utils/score.ts. */
export interface ScoreSettings {
  /** Points of a perfect round. */
  maxScore: number
  /** Guesses closer than this (meters) get `maxScore`. */
  perfectDistanceMeters: number
  /** Distance (meters) at which the score decays to ~37% (1/e) of `maxScore`. */
  scaleMeters: number
}

export interface GameModeConfig {
  mode: GameMode
  /** URL-friendly identifier. */
  slug: string
  name: string
  description: string
  roundsCount: number
  score: ScoreSettings
}

/**
 * Catalogue of the playable modes. Pure data: shared by the server (game
 * creation, scoring) and the client (main menu cards, HUD).
 */
export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  [GameMode.WORLD_CITIES]: {
    mode: GameMode.WORLD_CITIES,
    slug: 'ciudades-del-mundo',
    name: 'Ciudades del mundo',
    description: 'Aparecés en una calle de una de 20 grandes ciudades. ¿Sabés cuál es y dónde estás?',
    roundsCount: 5,
    // The city is not revealed: finding the right city already gives a good
    // score, and pinpointing the street inside it is what completes the 5000.
    score: { maxScore: 5000, perfectDistanceMeters: 25, scaleMeters: 15000 }
  }
}

export function getGameModeConfig(mode: GameMode): GameModeConfig {
  const config = GAME_MODES[mode]

  if (!config) {
    throw new Error(`Unknown game mode: ${mode}`)
  }

  return config
}

export function isValidGameMode(mode: unknown): mode is GameMode {
  return typeof mode === 'number' && mode in GAME_MODES
}
