import { DailyLeaderboardInput } from '@/app/(protected)/(game)/models/DailyLeaderboardInput'
import { getDailyLeaderboard } from '@/app/(protected)/(game)/services/dailyChallenges'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getDailyLeaderboard — ranking of a daily challenge ({ challengeId } or { day }; none: today's). */
export const POST = withAuth(async (request, _context, userId) =>
  getDailyLeaderboard(userId, (await request.json()) as DailyLeaderboardInput)
)
