import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import type { GameButtonColor } from '@/app/components/GameButton'

/**
 * Accent color of each game mode. It is the color of the mode in the main
 * menu and the one of its main buttons in every screen of the mode, so the
 * player always knows where he is: Classic → gold, With friends → cyan,
 * Battle Royale → magenta (the red of the menu).
 */
const MODE_COLORS: Record<GameMode, GameButtonColor> = {
  [GameMode.CLASSIC]: 'gold',
  [GameMode.CLASSIC_MULTIPLAYER]: 'cyan',
  [GameMode.BATTLE_ROYALE]: 'magenta'
}

/** Accent color of a mode (gold when the mode is unknown). */
export function getModeColor(mode: GameMode | undefined | null): GameButtonColor {
  return (mode != null && MODE_COLORS[mode]) || 'gold'
}
