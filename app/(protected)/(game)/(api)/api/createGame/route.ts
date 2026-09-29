import { CreateGameInput } from '@/app/(protected)/(game)/models/CreateGameInput'
import { createGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/**
 * POST /api/createGame — creates a game of a quest in one of its modes for the
 * signed-in player ({ questId, mode }). Single player games start right away;
 * multiplayer games wait for players. Returns the game view.
 */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as CreateGameInput

  return createGame(userId, input)
})
