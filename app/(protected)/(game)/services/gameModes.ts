import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettings } from '@/app/(protected)/(game)/models/GameSettings'
import { Map } from '@/app/(protected)/(game)/models/Map'
import { battleRoyaleMode } from '@/app/(protected)/(game)/services/battleRoyaleMode'
import { classicMode } from '@/app/(protected)/(game)/services/classicMode'
import { classicMultiplayerMode } from '@/app/(protected)/(game)/services/classicMultiplayerMode'
import { ApiException } from '@/app/models/ApiException'

/**
 * Registry of the game modes: GameMode → its engine. A mode is playable (and
 * offered in the main menu) once its engine is registered here.
 *
 * Built on every call (it is tiny) instead of at module load, so an import
 * cycle can never see an engine that is not initialized yet.
 */
function getEngines(): Partial<Record<GameMode, GameModeEngine>> {
  return {
    [GameMode.CLASSIC]: classicMode as GameModeEngine,
    [GameMode.CLASSIC_MULTIPLAYER]: classicMultiplayerMode as GameModeEngine,
    [GameMode.BATTLE_ROYALE]: battleRoyaleMode as GameModeEngine
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

/**
 * The game modes of the main menu (the first choice of the player): every
 * registered mode, with its fixed rules (rounds, time limit...).
 */
export function getGameModes(): GameModeView[] {
  return getGameModeEngines()
    .map(({ definition }) => ({
      mode: definition.mode,
      slug: definition.slug,
      name: definition.name,
      description: definition.description,
      image: definition.image,
      minPlayers: definition.minPlayers,
      maxPlayers: definition.maxPlayers,
      settings: definition.settings as GameSettings
    }))
    .sort((a, b) => a.mode - b.mode)
}

/**
 * Settings of a new game of a mode played in a map: the fixed settings of the
 * mode, except the score scale, which the map can override (it depends on the
 * size of its region).
 */
export function getGameSettings<Settings>(engine: GameModeEngine<unknown, Settings>, map: Map): Settings {
  const { settings } = engine.definition
  const scoreMaxDistanceKm = Number(map.settings?.scoreMaxDistanceKm)

  return Number.isFinite(scoreMaxDistanceKm) && scoreMaxDistanceKm > 0 ? { ...settings, scoreMaxDistanceKm } : settings
}
