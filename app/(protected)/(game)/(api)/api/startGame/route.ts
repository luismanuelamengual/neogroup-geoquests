import { GameIdInput } from '@/app/(protected)/(game)/models/GameIdInput'
import { startGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/startGame — the host starts a multiplayer game ({ gameId }): its rounds are chosen and the first begins. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as GameIdInput

  return startGame(userId, input)
})
