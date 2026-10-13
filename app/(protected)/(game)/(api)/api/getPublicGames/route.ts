import { getPublicGames } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/getPublicGames — public multiplayer games waiting for players, that anybody can join. */
export const POST = withAuth(async () => getPublicGames())
