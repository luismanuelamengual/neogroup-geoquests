import { getRecentGames } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getRecentGames — latest games of the signed-in player. */
export const POST = withAuth(async (_request, _context, userId) => {
  return getRecentGames(userId)
})
