import { createCheckoutUrl, isLemonSqueezyConfigured } from '@/app/(protected)/(premium)/services/lemonSqueezy'
import { isFreemiumEnabled } from '@/app/(protected)/(premium)/services/premium'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'
import { withAuth } from '@/app/utils/api-server'
import { resolveAppUrl } from '@/app/utils/urls'

/**
 * POST /api/createCheckout — creates a Lemon Squeezy checkout of the ad-free
 * year for the signed-in player and returns its URL. After paying, the player
 * comes back to /account?upgraded=1 (the days are granted by the webhook).
 */
export const POST = withAuth(async (request, _context, userId) => {
  if (!isFreemiumEnabled()) {
    throw new ApiException('errors.freemiumDisabled', 404)
  }

  if (!isLemonSqueezyConfigured()) {
    throw new ApiException('errors.paymentsNotConfigured', 503)
  }

  const user = await User.find(userId)

  if (!user) {
    throw new ApiException('errors.notAuthenticated', 401)
  }

  const redirectUrl = `${resolveAppUrl(request.headers.get('host') ?? '')}/account?upgraded=1`

  return { url: await createCheckoutUrl(userId, user.email, redirectUrl) }
})
