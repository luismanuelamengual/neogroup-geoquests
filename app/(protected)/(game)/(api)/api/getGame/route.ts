import { getGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getGame — a game of the signed-in player (answers only for the rounds already played). */
export const POST = withAuth(async (request, _context, userId) => {
  const { gameId } = (await request.json()) as { gameId: number }

  return getGame(userId, Number(gameId))
})
