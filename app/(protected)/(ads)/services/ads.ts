import { AdsConfig } from '@/app/(protected)/(ads)/models/AdsConfig'
import { User } from '@/app/models/User'

/**
 * Ads (Google AdSense) are switched on and off for everybody with the
 * ADS_ENABLED environment variable (read at runtime: on Vercel, redeploy after
 * changing it). A particular player can be exempted by hand in the database
 * with `users.adsDisabled = true`.
 */

export function isAdsEnabled(): boolean {
  return process.env.ADS_ENABLED === 'true'
}

/** Whether the user has to see ads. */
export function shouldShowAds(user: Pick<User, 'adsDisabled'>): boolean {
  return isAdsEnabled() && !user.adsDisabled
}

/** What AdsProvider needs, for a signed-in player or (null) a visitor of the public pages. */
export function getAdsConfig(user: Pick<User, 'adsDisabled'> | null): AdsConfig {
  return {
    showAds: user ? shouldShowAds(user) : isAdsEnabled(),
    client: process.env.ADSENSE_CLIENT_ID || null,
    slot: process.env.ADSENSE_SLOT_ID || null
  }
}
