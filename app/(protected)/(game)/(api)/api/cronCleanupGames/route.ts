import { cleanupAbandonedGames } from '@/app/(protected)/(game)/services/games'
import { ApiException } from '@/app/models/ApiException'
import { withApi } from '@/app/utils/api-server'
import { isAuthorizedCronRequest } from '@/app/utils/cron'

/**
 * GET /api/cronCleanupGames — scheduled cleanup of abandoned games (Vercel
 * Cron, see vercel.json). The only GET endpoint: Vercel Cron calls with GET
 * and `Authorization: Bearer <CRON_SECRET>`.
 */
export const GET = withApi(async (request) => {
  if (!isAuthorizedCronRequest(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    throw new ApiException('errors.unauthorized', 401)
  }

  return { cleaned: await cleanupAbandonedGames() }
})
