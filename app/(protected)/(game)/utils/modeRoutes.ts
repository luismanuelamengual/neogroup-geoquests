import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'

/** Menu of the single player games ("Jugar"). */
export const SINGLE_PLAYER_MENU_PATH = '/play'

/** Menu of the multiplayer games ("Multijugador"). */
export const MULTIPLAYER_MENU_PATH = '/multiplayer'

/** Menu a mode belongs to: "Jugar" for single player modes, "Multijugador" for the others. */
export function getModeMenuPath({ maxPlayers }: Pick<GameModeView, 'maxPlayers'>): string {
  return maxPlayers > 1 ? MULTIPLAYER_MENU_PATH : SINGLE_PLAYER_MENU_PATH
}

/** Page where the rules and the map of a mode are chosen: /play/classic, /multiplayer/battle-royale... */
export function getModePath(mode: Pick<GameModeView, 'maxPlayers' | 'slug'>): string {
  return `${getModeMenuPath(mode)}/${mode.slug}`
}
