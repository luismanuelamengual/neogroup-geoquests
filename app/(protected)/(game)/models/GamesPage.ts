import { GameListItem } from '@/app/(protected)/(game)/models/GameListItem'

/** A page of the player's games ("Mis partidas"). */
export interface GamesPage {
  items: GameListItem[]
  hasMore: boolean
}
