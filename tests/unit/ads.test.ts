import { afterEach, describe, expect, it } from 'vitest'
import { shouldShowAds } from '@/app/(protected)/(ads)/services/ads'

describe('ads', () => {
  // The environment running the tests may define ADS_ENABLED (e.g. a Vercel build): each test sets its own.
  const originalAdsEnabled = process.env.ADS_ENABLED

  afterEach(() => {
    if (originalAdsEnabled === undefined) {
      delete process.env.ADS_ENABLED
    } else {
      process.env.ADS_ENABLED = originalAdsEnabled
    }
  })

  it('are shown only with ADS_ENABLED on, except to the exempted players', () => {
    process.env.ADS_ENABLED = 'false'
    expect(shouldShowAds({ adsDisabled: false })).toBe(false)

    process.env.ADS_ENABLED = 'true'
    expect(shouldShowAds({ adsDisabled: false })).toBe(true)
    expect(shouldShowAds({ adsDisabled: true })).toBe(false)
  })
})
