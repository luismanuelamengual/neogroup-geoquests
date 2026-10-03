import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import type { GameButtonColor } from '@/app/components/GameButton'

/** Modes played alone; every other mode is multiplayer. */
const SINGLE_PLAYER_MODES = new Set<GameMode>([GameMode.CLASSIC])

/** Whether a mode is played with other players. */
export function isMultiplayerMode(mode: GameMode | undefined | null): boolean {
  return mode != null && !SINGLE_PLAYER_MODES.has(mode)
}

/**
 * Accent color of a game mode: gold for the single player modes, cyan for
 * the multiplayer ones. It is the color of the mode in the main menu and the
 * one of its main buttons in every screen of the mode, so the player always
 * knows whether he plays alone or with others. Gold when the mode is unknown.
 */
export function getModeColor(mode: GameMode | undefined | null): GameButtonColor {
  return isMultiplayerMode(mode) ? 'cyan' : 'gold'
}
