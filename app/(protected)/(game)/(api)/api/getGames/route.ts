import { getGames } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getGames — games of the signed-in player, newest first ({ offset, limit }). */
export const POST = withAuth(async (request, _context, userId) => {
  const { offset, limit } = (await request.json()) as { offset?: number; limit?: number }

  return getGames(userId, Number(offset ?? 0), Number(limit ?? 20))
})
