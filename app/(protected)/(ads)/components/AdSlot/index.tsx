'use client'

import './index.scss'
import classNames from 'classnames'
import { useEffect } from 'react'
import { useAds } from '@/app/(protected)/(ads)/components/AdsProvider'
import { useT } from '@/app/i18n/I18nProvider'
import { isProduction } from '@/app/utils/environment'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

function AdUnit({ client, slot }: { client: string; slot: string }) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Blocked by an ad blocker or already filled: nothing to do.
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

/**
 * A responsive AdSense banner. Renders nothing with ADS_ENABLED off or for
 * players exempted from the ads (users.adsDisabled). Without AdSense configured it shows
 * a placeholder outside production, to see where the ads go.
 */
export default function AdSlot({ className }: { className?: string }) {
  const t = useT()
  const { showAds, client, slot } = useAds()
  const configured = !!client && !!slot

  if (!showAds || (!configured && isProduction)) {
    return null
  }

  return (
    <aside className={classNames('ad-slot', className)}>
      <span className="label">{t('ads.label')}</span>
      {configured ? <AdUnit client={client} slot={slot} /> : <div className="placeholder">{t('ads.label')}</div>}
    </aside>
  )
}
