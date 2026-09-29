import { getActiveGame } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getActiveGame — the multiplayer game the signed-in player is waiting for or playing (null if none). */
export const POST = withAuth(async (_request, _context, userId) => getActiveGame(userId))
