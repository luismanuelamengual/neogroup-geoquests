import { cleanupExpiredGames } from '@/app/(protected)/(game)/services/games'
import { ApiException } from '@/app/models/ApiException'
import { withApi } from '@/app/utils/api-server'
import { isAuthorizedCronRequest } from '@/app/utils/cron'

/**
 * GET /api/cronCleanupGames — scheduled cleanup of expired games: stale lobbies,
 * abandoned games and games past the retention period (Vercel Cron, see vercel.json). The only GET endpoint: Vercel Cron calls with GET
 * and `Authorization: Bearer <CRON_SECRET>`.
 */
export const GET = withApi(async (request) => {
  if (!isAuthorizedCronRequest(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    throw new ApiException('errors.unauthorized', 401)
  }

  return { cleaned: await cleanupExpiredGames() }
})
