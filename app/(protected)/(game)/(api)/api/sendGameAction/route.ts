import { GameActionInput } from '@/app/(protected)/(game)/models/GameActionInput'
import { sendGameAction } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/**
 * POST /api/sendGameAction — an action of the signed-in player in one of their
 * games ({ gameId, action }, e.g. a guess). Returns the updated game view.
 */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as GameActionInput

  return sendGameAction(userId, input)
})
