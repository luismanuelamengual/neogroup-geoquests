import { startRound } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/startRound — starts the clock of the current round (timed quests); idempotent. */
export const POST = withAuth(async (request, _context, userId) => {
  const { token } = (await request.json()) as { token: string }

  return startRound(userId, token)
})
