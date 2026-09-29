import { timingSafeEqual } from 'crypto'

/**
 * Whether a request comes from the scheduler (Vercel Cron): it must carry
 * `Authorization: Bearer <CRON_SECRET>`. Without a configured secret nothing
 * is authorized, so the cron endpoints are closed by default.
 */
export function isAuthorizedCronRequest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || !authorization) {
    return false
  }

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(authorization)

  return expected.length === received.length && timingSafeEqual(expected, received)
}
