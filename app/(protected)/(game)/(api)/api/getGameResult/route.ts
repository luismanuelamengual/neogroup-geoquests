import { getGameResult } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getGameResult — final result of a game of the signed-in player (no round details). */
export const POST = withAuth(async (request, _context, userId) => {
  const { gameId } = (await request.json()) as { gameId: number }

  return getGameResult(userId, Number(gameId))
})
