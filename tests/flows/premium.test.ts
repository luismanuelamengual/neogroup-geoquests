import { createHmac } from 'crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Payment } from '@/app/(protected)/(premium)/models/Payment'
import { isValidWebhookSignature, parseWebhookEvent } from '@/app/(protected)/(premium)/services/lemonSqueezy'
import {
  applyPaidOrder,
  applyRefundedOrder,
  isAdFree,
  PREMIUM_DAYS,
  shouldShowAds
} from '@/app/(protected)/(premium)/services/premium'
import { User } from '@/app/models/User'
import { createUser, resetDatabase } from '@/tests/setup/database'

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = new Date('2026-10-13T12:00:00Z')

function order(userId: number, providerPaymentId = 'order-1') {
  return { provider: 'lemonsqueezy', providerPaymentId, userId, amount: 1000, currency: 'USD' }
}

describe('freemium', () => {
  let userId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
  })

  afterEach(() => {
    delete process.env.FREEMIUM_ENABLED
  })

  it('shows ads only with freemium on and no ad-free time left', () => {
    const free = { premiumUntil: null }
    const paid = { premiumUntil: new Date(NOW.getTime() + DAY_MS) }
    const expired = { premiumUntil: new Date(NOW.getTime() - DAY_MS) }

    expect(shouldShowAds(free, NOW)).toBe(false)
    process.env.FREEMIUM_ENABLED = 'true'
    expect(shouldShowAds(free, NOW)).toBe(true)
    expect(shouldShowAds(paid, NOW)).toBe(false)
    expect(shouldShowAds(expired, NOW)).toBe(true)
  })

  it('a paid order grants a year without ads, once', async () => {
    expect(await applyPaidOrder(order(userId), NOW)).toBe(true)
    expect(await applyPaidOrder(order(userId), NOW)).toBe(false)

    const user = (await User.find(userId))!

    expect(user.premiumUntil!.getTime()).toBe(NOW.getTime() + PREMIUM_DAYS * DAY_MS)
    expect(isAdFree(user, NOW)).toBe(true)
    expect(await Payment.where('userId', userId).get()).toHaveLength(1)
  })

  it('buying again before it expires adds the year to the remaining time', async () => {
    await applyPaidOrder(order(userId, 'order-1'), NOW)
    await applyPaidOrder(order(userId, 'order-2'), new Date(NOW.getTime() + 100 * DAY_MS))

    const user = (await User.find(userId))!

    expect(user.premiumUntil!.getTime()).toBe(NOW.getTime() + 2 * PREMIUM_DAYS * DAY_MS)
  })

  it('a refund takes the days back', async () => {
    await applyPaidOrder(order(userId), NOW)

    expect(await applyRefundedOrder('order-1', NOW)).toBe(true)
    expect(await applyRefundedOrder('order-1', NOW)).toBe(false)
    expect((await User.find(userId))!.premiumUntil).toBeNull()
    expect((await Payment.where('providerPaymentId', 'order-1').first())!.status).toBe('refunded')
  })

  it('ignores orders of unknown players', async () => {
    expect(await applyPaidOrder(order(9999), NOW)).toBe(false)
  })
})

describe('Lemon Squeezy webhooks', () => {
  it('accept only bodies signed with the secret', () => {
    const body = '{"meta":{}}'
    const signature = createHmac('sha256', 's3cret').update(body).digest('hex')

    expect(isValidWebhookSignature(body, signature, 's3cret')).toBe(true)
    expect(isValidWebhookSignature(body, signature, 'other')).toBe(false)
    expect(isValidWebhookSignature(body, null, 's3cret')).toBe(false)
    expect(isValidWebhookSignature(body, signature, undefined)).toBe(false)
  })

  it('read paid orders, refunds and ignore the rest', () => {
    const data = { type: 'orders', id: 42, attributes: { status: 'paid', total: 1000, currency: 'USD' } }

    expect(parseWebhookEvent({ meta: { event_name: 'order_created', custom_data: { user_id: '7' } }, data })).toEqual({
      type: 'paid',
      orderId: '42',
      userId: 7,
      amount: 1000,
      currency: 'USD'
    })
    expect(parseWebhookEvent({ meta: { event_name: 'order_refunded' }, data })).toEqual({
      type: 'refunded',
      orderId: '42'
    })
    expect(parseWebhookEvent({ meta: { event_name: 'order_created' }, data })).toEqual({ type: 'ignored' })
    expect(
      parseWebhookEvent({
        meta: { event_name: 'order_created', custom_data: { user_id: '7' } },
        data: { ...data, attributes: { ...data.attributes, status: 'pending' } }
      })
    ).toEqual({ type: 'ignored' })
    expect(
      parseWebhookEvent({ meta: { event_name: 'subscription_created' }, data: { type: 'subscriptions', id: 1 } })
    ).toEqual({
      type: 'ignored'
    })
  })
})
