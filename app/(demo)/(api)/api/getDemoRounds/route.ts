import { getDemoRounds } from '@/app/(demo)/services/demo'
import { withApi } from '@/app/utils/api-server'

/** POST /api/getDemoRounds — the locations of a trial game (public: no session needed). */
export const POST = withApi(async () => getDemoRounds())
