import { getGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getGame — view of a game from its token (answers only for the rounds already played). */
export const POST = withAuth(async (request, _context, userId) => {
  const { token } = (await request.json()) as { token: string }

  return getGame(userId, token)
})
