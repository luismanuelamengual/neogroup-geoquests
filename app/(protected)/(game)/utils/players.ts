import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import { DEFAULT_LOCALE, Locale } from '@/app/i18n/config'

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

/** Ordinal of a position: "1.º", "2.º"... in Spanish, "1st", "2nd"... in English. */
export function formatPosition(position: number, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === 'en') {
    const rest = position % 100
    const suffix =
      rest >= 11 && rest <= 13
        ? 'th'
        : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[position % 10] ?? 'th')

    return `${position}${suffix}`
  }

  return `${position}.º`
}
