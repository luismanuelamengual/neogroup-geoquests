import { isAdsEnabled } from '@/app/(protected)/(ads)/services/ads'

/**
 * GET /ads.txt — authorizes Google AdSense to sell the ads of this site (AdSense
 * asks for it). Built from ADSENSE_CLIENT_ID; 404 while ads are off.
 */
export function GET(): Response {
  const client = process.env.ADSENSE_CLIENT_ID

  if (!isAdsEnabled() || !client) {
    return new Response('Not found', { status: 404 })
  }

  const publisherId = client.replace(/^ca-/, '')

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
