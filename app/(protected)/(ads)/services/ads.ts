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
