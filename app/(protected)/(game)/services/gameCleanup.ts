import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { getGameModeEngines } from '@/app/(protected)/(game)/services/gameModes'
import { updateGame } from '@/app/(protected)/(game)/services/gamePersistence'

/** Multiplayer games still waiting for players after this long are deleted. */
export const LOBBY_MAX_AGE_MS = 30 * 60 * 1000

/** Deletes games and their players. */
export async function deleteGames(gameIds: number[]): Promise<void> {
  if (gameIds.length === 0) {
    return
  }

  await DB.table('game_players').whereIn('gameId', gameIds).delete()
  await DB.table('games').whereIn('id', gameIds).delete()
}

/**
 * Cleans up the games nobody is playing anymore, to keep the tables small:
 *
 *   - multiplayer games waiting for players for more than LOBBY_MAX_AGE_MS → deleted;
 *   - games in progress without activity (no write) for longer than their mode's
 *     `abandonAfterMs` → deleted or finished with the results they had, as the
 *     mode says (`abandonAction`).
 *
 * Returns how many games were cleaned up.
 */
export async function cleanupGames(ctx: GameContext): Promise<number> {
  const now = ctx.now.getTime()
  const lobbies = await Game.where('status', GameStatus.LOBBY)
    .where('createdAt', '<', new Date(now - LOBBY_MAX_AGE_MS))
    .select('id')
    .get()
  let cleaned = lobbies.length

  await deleteGames(lobbies.map((game) => game.id))

  for (const { definition } of getGameModeEngines()) {
    const abandoned = await Game.where('status', GameStatus.IN_PROGRESS)
      .where('mode', definition.mode)
      .where('updatedAt', '<', new Date(now - definition.abandonAfterMs))
      .select('id')
      .get()

    if (definition.abandonAction === 'delete') {
      await deleteGames(abandoned.map((game) => game.id))
    } else {
      for (const game of abandoned) {
        await updateGame(game.id, ctx, undefined, { finish: true })
      }
    }

    cleaned += abandoned.length
  }

  return cleaned
}
