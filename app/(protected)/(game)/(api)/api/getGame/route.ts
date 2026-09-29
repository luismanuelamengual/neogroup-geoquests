import { GetGameInput } from '@/app/(protected)/(game)/models/GetGameInput'
import { getGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/**
 * POST /api/getGame — current view of a game of the signed-in player
 * ({ gameId, sinceVersion? }); `{ unchanged: true }` when it is still at `sinceVersion`.
 */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as GetGameInput

  return getGame(userId, input)
})
