import { StartGameInput } from '@/app/(protected)/(game)/models/StartGameInput'
import { startGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/startGame — creates a new game (with its rounds already chosen) for the signed-in player. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as StartGameInput

  return startGame(userId, Number(input.mode))
})
