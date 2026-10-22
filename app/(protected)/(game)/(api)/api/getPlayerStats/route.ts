import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getPlayerStats — stats and streak of the signed-in player (refreshed after a game ends). */
export const POST = withAuth(async (_request, _context, userId) => getPlayerStats(userId))
