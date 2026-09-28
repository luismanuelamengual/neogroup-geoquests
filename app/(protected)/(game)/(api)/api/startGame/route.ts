import { StartGameInput } from '@/app/(protected)/(game)/models/StartGameInput'
import { startGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/startGame — creates a new game of a quest for the signed-in player: returns its view and its encrypted token. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as StartGameInput

  return startGame(userId, Number(input.questId))
})
