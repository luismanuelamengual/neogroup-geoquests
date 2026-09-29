import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { classicMode } from '@/app/(protected)/(game)/services/classicMode'
import { classicMultiplayerMode } from '@/app/(protected)/(game)/services/classicMultiplayerMode'
import { ApiException } from '@/app/models/ApiException'

/**
 * Registry of the game modes: GameMode → its engine. A mode is playable once
 * its engine is registered here (and a quest offers it in `quest_modes`).
 *
 * Built on every call (it is tiny) instead of at module load, so the import
 * cycle engine → rounds → quests → registry can never see an engine that is
 * not initialized yet.
 */
function getEngines(): Partial<Record<GameMode, GameModeEngine>> {
  return {
    [GameMode.CLASSIC]: classicMode as GameModeEngine,
    [GameMode.CLASSIC_MULTIPLAYER]: classicMultiplayerMode as GameModeEngine
  }
}

/** Engine of a mode, or null when the mode does not exist or has no engine yet. */
export function findGameModeEngine(mode: unknown): GameModeEngine | null {
  return getEngines()[Number(mode) as GameMode] ?? null
}

/** Engine of a mode; throws when the mode is not available. */
export function getGameModeEngine(mode: unknown): GameModeEngine {
  const engine = findGameModeEngine(mode)

  if (!engine) {
    throw new ApiException('Modo de juego no disponible', 400)
  }

  return engine
}

/** Every registered engine. */
export function getGameModeEngines(): GameModeEngine[] {
  return Object.values(getEngines()).filter((engine): engine is GameModeEngine => !!engine)
}
