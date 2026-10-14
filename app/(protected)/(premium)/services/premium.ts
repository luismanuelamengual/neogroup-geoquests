import { DB } from '@neogroup/neorm'
import { Payment } from '@/app/(protected)/(premium)/models/Payment'
import { User } from '@/app/models/User'

/**
 * Freemium: everybody plays for free with ads, and a payment removes them for
 * PREMIUM_DAYS (a one-off payment, no automatic renewal). Paying again before
 * it expires adds the days to the remaining ones.
 *
 * The whole model is switched on and off with the FREEMIUM_ENABLED environment
 * variable (read at runtime): off, nobody sees ads and nothing can be bought,
 * but `users.premiumUntil` is kept, so turning it back on takes nobody's paid
 * days away. Payments already started are still applied by the webhook.
 */

export const PREMIUM_DAYS = 365

/** Price shown next to the buy button (the real one is the price of the product in Lemon Squeezy). */
export const PREMIUM_PRICE_LABEL = 'USD 10'

const DAY_MS = 24 * 60 * 60 * 1000

export function isFreemiumEnabled(): boolean {
  return process.env.FREEMIUM_ENABLED === 'true'
}

/** Whether the user still has ad-free time left. */
export function isAdFree(user: Pick<User, 'premiumUntil'>, now = new Date()): boolean {
  return !!user.premiumUntil && user.premiumUntil.getTime() > now.getTime()
}

/** Whether the user has to see ads right now. */
export function shouldShowAds(user: Pick<User, 'premiumUntil'>, now = new Date()): boolean {
  return isFreemiumEnabled() && !isAdFree(user, now)
}

export interface PaidOrder {
  provider: string
  providerPaymentId: string
  userId: number
  amount: number
  currency: string
}

/**
 * Registers a paid order and extends the ad-free time of its user by
 * PREMIUM_DAYS, counted from its current expiry when it has not expired yet.
 * Idempotent: an order already registered is ignored. Returns whether it was applied.
 */
export async function applyPaidOrder(order: PaidOrder, now = new Date()): Promise<boolean> {
  return await DB.transaction(async () => {
    if (await Payment.where('providerPaymentId', order.providerPaymentId).first()) {
      return false
    }

    const user = await User.find(order.userId)

    if (!user) {
      return false
    }

    const payment = new Payment()

    payment.userId = Number(user.id)
    payment.provider = order.provider
    payment.providerPaymentId = order.providerPaymentId
    payment.amount = order.amount
    payment.currency = order.currency
    payment.status = 'paid'
    payment.daysGranted = PREMIUM_DAYS
    await payment.save()

    const base = isAdFree(user, now) ? user.premiumUntil!.getTime() : now.getTime()

    user.premiumUntil = new Date(base + PREMIUM_DAYS * DAY_MS)
    await user.save()

    return true
  })
}

/**
 * Takes back the days a refunded order granted. Idempotent: unknown or
 * already refunded orders are ignored. Returns whether it was applied.
 */
export async function applyRefundedOrder(providerPaymentId: string, now = new Date()): Promise<boolean> {
  return await DB.transaction(async () => {
    const payment = await Payment.where('providerPaymentId', providerPaymentId).first()

    if (!payment || payment.status === 'refunded') {
      return false
    }

    payment.status = 'refunded'
    await payment.save()

    const user = await User.find(payment.userId)

    if (user?.premiumUntil) {
      const premiumUntil = new Date(user.premiumUntil.getTime() - payment.daysGranted * DAY_MS)

      user.premiumUntil = premiumUntil.getTime() > now.getTime() ? premiumUntil : null
      await user.save()
    }

    return true
  })
}
