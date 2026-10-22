import { getDailyChallenge } from '@/app/(protected)/(game)/services/dailyChallenges'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getDailyChallenge — today's challenge and how it went for the signed-in player. */
export const POST = withAuth(async (_request, _context, userId) => getDailyChallenge(userId))
