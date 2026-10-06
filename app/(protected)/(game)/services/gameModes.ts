import { DetectiveDifficulty } from '@/app/(protected)/(game)/models/DetectiveDifficulty'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettings } from '@/app/(protected)/(game)/models/GameSettings'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { Map } from '@/app/(protected)/(game)/models/Map'
import { battleRoyaleMode } from '@/app/(protected)/(game)/services/battleRoyaleMode'
import { classicMode } from '@/app/(protected)/(game)/services/classicMode'
import { classicMultiplayerMode } from '@/app/(protected)/(game)/services/classicMultiplayerMode'
import { detectiveMode } from '@/app/(protected)/(game)/services/detectiveMode'
import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'
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
    [GameMode.BATTLE_ROYALE]: battleRoyaleMode as GameModeEngine,
    [GameMode.DETECTIVE]: detectiveMode as GameModeEngine
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
    throw new ApiException('errors.gameModeUnavailable', 400)
  }

  return engine
}

/** Every registered engine. */
export function getGameModeEngines(): GameModeEngine[] {
  return Object.values(getEngines()).filter((engine): engine is GameModeEngine => !!engine)
}

/**
 * The game modes of the main menu (the first choice of the player): every
 * registered mode, with its default rules and the ones the player can choose.
 */
export function getGameModes(t?: Translator): GameModeView[] {
  return getGameModeEngines()
    .map(({ definition }) => ({
      mode: definition.mode,
      slug: definition.slug,
      name: t ? t(`modes.${definition.slug}.name` as MessageKey) : definition.name,
      description: t ? t(`modes.${definition.slug}.description` as MessageKey) : definition.description,
      image: definition.image,
      mapSlug: definition.mapSlug ?? null,
      minPlayers: definition.minPlayers,
      maxPlayers: definition.maxPlayers,
      settings: definition.settings as GameSettings,
      configurable: definition.configurable
    }))
    .sort((a, b) => a.mode - b.mode)
}

/** `value` when it is one of the `allowed` values; otherwise `fallback`. */
function pickAllowed<T>(value: unknown, allowed: T[] | undefined, fallback: T): T {
  return allowed && value !== undefined && allowed.includes(value as T) ? (value as T) : fallback
}

/**
 * Settings of a new game of a mode played in a map: the defaults of the mode,
 * with the rules chosen by the player (only the configurable ones, and only
 * with an allowed value: anything else keeps the default), and the score
 * scale of the map when it defines one (it depends on the size of its region).
 */
export function getGameSettings<Settings>(
  engine: GameModeEngine<unknown, Settings>,
  map: Map,
  input?: GameSettingsInput | null
): Settings {
  const { settings: defaults, configurable } = engine.definition
  const settings = { ...defaults } as Settings & {
    rounds?: number
    timeLimitSeconds?: number | null
    difficulty?: DetectiveDifficulty
  }

  if (configurable.rounds && settings.rounds !== undefined) {
    settings.rounds = pickAllowed(input?.rounds, configurable.rounds, settings.rounds)
  }

  if (configurable.timeLimitSeconds && settings.timeLimitSeconds !== undefined) {
    settings.timeLimitSeconds = pickAllowed(
      input?.timeLimitSeconds,
      configurable.timeLimitSeconds,
      settings.timeLimitSeconds
    )
  }

  if (configurable.difficulty && settings.difficulty !== undefined) {
    settings.difficulty = pickAllowed(input?.difficulty, configurable.difficulty, settings.difficulty)
  }

  const scoreMaxDistanceKm = Number(map.settings?.scoreMaxDistanceKm)

  return Number.isFinite(scoreMaxDistanceKm) && scoreMaxDistanceKm > 0 ? { ...settings, scoreMaxDistanceKm } : settings
}
