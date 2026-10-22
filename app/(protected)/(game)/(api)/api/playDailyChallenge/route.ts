import { playDailyChallenge } from '@/app/(protected)/(game)/services/dailyChallenges'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/playDailyChallenge — starts (or resumes) the signed-in player's attempt at today's challenge. */
export const POST = withAuth(async (_request, _context, userId) => playDailyChallenge(userId))
