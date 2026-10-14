import {
  isValidWebhookSignature,
  LEMON_SQUEEZY_PROVIDER,
  parseWebhookEvent
} from '@/app/(protected)/(premium)/services/lemonSqueezy'
import { applyPaidOrder, applyRefundedOrder } from '@/app/(protected)/(premium)/services/premium'
import { ApiException } from '@/app/models/ApiException'
import { withApi } from '@/app/utils/api-server'

/**
 * POST /api/lemonSqueezyWebhook — called by Lemon Squeezy (no session): a paid
 * order grants the ad-free year to the player in its custom data, a refund
 * takes it back. Only bodies signed with LEMONSQUEEZY_WEBHOOK_SECRET are
 * accepted. Applied even with FREEMIUM_ENABLED off, so no payment is lost.
 */
export const POST = withApi(async (request) => {
  const rawBody = await request.text()

  if (!isValidWebhookSignature(rawBody, request.headers.get('x-signature'), process.env.LEMONSQUEEZY_WEBHOOK_SECRET)) {
    throw new ApiException('errors.unauthorized', 401)
  }

  const event = parseWebhookEvent(JSON.parse(rawBody))

  if (event.type === 'paid') {
    const applied = await applyPaidOrder({
      provider: LEMON_SQUEEZY_PROVIDER,
      providerPaymentId: event.orderId,
      userId: event.userId,
      amount: event.amount,
      currency: event.currency
    })

    return { applied }
  }

  if (event.type === 'refunded') {
    return { applied: await applyRefundedOrder(event.orderId) }
  }

  return { applied: false }
})
