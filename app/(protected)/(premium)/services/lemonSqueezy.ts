import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Lemon Squeezy (merchant of record: charges in any currency and country and
 * handles the taxes). The ad-free year is a single-payment product; its
 * variant is bought through a checkout created for the signed-in player, who
 * travels in `custom.user_id` and comes back in the webhooks.
 *
 *   LEMONSQUEEZY_API_KEY         → Settings → API
 *   LEMONSQUEEZY_STORE_ID        → Settings → Stores (the numeric id)
 *   LEMONSQUEEZY_VARIANT_ID      → the variant of the product "1 year without ads"
 *   LEMONSQUEEZY_WEBHOOK_SECRET  → Settings → Webhooks (signing secret), events order_created + order_refunded
 */

const API_URL = 'https://api.lemonsqueezy.com/v1'

export const LEMON_SQUEEZY_PROVIDER = 'lemonsqueezy'

export function isLemonSqueezyConfigured(): boolean {
  return !!(
    process.env.LEMONSQUEEZY_API_KEY &&
    process.env.LEMONSQUEEZY_STORE_ID &&
    process.env.LEMONSQUEEZY_VARIANT_ID
  )
}

/** Creates a checkout of the ad-free year for a player and returns its URL. */
export async function createCheckoutUrl(userId: number, email: string, redirectUrl: string): Promise<string> {
  const response = await fetch(`${API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { email, custom: { user_id: String(userId) } },
          product_options: { redirect_url: redirectUrl }
        },
        relationships: {
          store: { data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(process.env.LEMONSQUEEZY_VARIANT_ID) } }
        }
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Lemon Squeezy checkout failed: ${response.status} ${await response.text()}`)
  }

  const body = (await response.json()) as { data?: { attributes?: { url?: string } } }
  const url = body.data?.attributes?.url

  if (!url) {
    throw new Error('Lemon Squeezy checkout without URL')
  }

  return url
}

/** Whether a webhook body was signed by Lemon Squeezy: `X-Signature` is the hex HMAC-SHA256 of the raw body. */
export function isValidWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!secret || !signature) {
    return false
  }

  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'))
  const received = Buffer.from(signature)

  return expected.length === received.length && timingSafeEqual(expected, received)
}

export type LemonSqueezyEvent =
  | { type: 'paid'; orderId: string; userId: number; amount: number; currency: string }
  | { type: 'refunded'; orderId: string }
  | { type: 'ignored' }

interface WebhookPayload {
  meta?: { event_name?: string; custom_data?: { user_id?: string | number } }
  data?: { type?: string; id?: string | number; attributes?: { status?: string; total?: number; currency?: string } }
}

/** Reads what matters of a webhook: a paid order of a player, a refund, or something else. */
export function parseWebhookEvent(payload: WebhookPayload): LemonSqueezyEvent {
  const eventName = payload.meta?.event_name
  const data = payload.data

  if (data?.type !== 'orders' || data.id == null) {
    return { type: 'ignored' }
  }

  const orderId = String(data.id)

  if (eventName === 'order_refunded') {
    return { type: 'refunded', orderId }
  }

  const userId = Number(payload.meta?.custom_data?.user_id)

  if (eventName === 'order_created' && data.attributes?.status === 'paid' && Number.isInteger(userId) && userId > 0) {
    return {
      type: 'paid',
      orderId,
      userId,
      amount: Number(data.attributes.total ?? 0),
      currency: String(data.attributes.currency ?? 'USD')
    }
  }

  return { type: 'ignored' }
}
