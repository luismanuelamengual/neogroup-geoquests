import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'

/** Colors of the players of a multiplayer game (pins, avatars), in joining order. */
export const PLAYER_COLORS = ['#ff4d8d', '#22d3ee', '#84f06b', '#a78bfa', '#fb923c', '#f472b6', '#2dd4bf', '#facc15']

/** Color of each player of a game (by user id), stable for the whole game: it follows the joining order. */
export function getPlayerColors(players: GamePlayerView[]): Map<number, string> {
  return new Map(players.map((player, index) => [player.userId, PLAYER_COLORS[index % PLAYER_COLORS.length]]))
}

/** Initial of a player name (pins, avatars). */
export function getPlayerInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

/** "1.º", "2.º"... */
export function formatPosition(position: number): string {
  return `${position}.º`
}
