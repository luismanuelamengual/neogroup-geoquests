import { JoinGameInput } from '@/app/(protected)/(game)/models/JoinGameInput'
import { joinGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/joinGame — the signed-in player joins a multiplayer game waiting for players ({ code }). */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as JoinGameInput

  return joinGame(userId, input)
})
