import { KickPlayerInput } from '@/app/(protected)/(game)/models/KickPlayerInput'
import { kickPlayer } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/kickPlayer — the host removes a player before the game starts ({ gameId, userId }). */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as KickPlayerInput

  return kickPlayer(userId, input)
})
