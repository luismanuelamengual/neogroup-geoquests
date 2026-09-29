import { GameIdInput } from '@/app/(protected)/(game)/models/GameIdInput'
import { leaveGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/leaveGame — the signed-in player leaves a multiplayer game ({ gameId }). */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as GameIdInput

  await leaveGame(userId, input)
})
