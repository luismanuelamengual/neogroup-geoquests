'use client'

import './index.scss'
import classNames from 'classnames'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAds } from '@/app/(protected)/(premium)/components/AdsProvider'
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
 * A responsive AdSense banner, with a link to remove the ads. Renders nothing
 * for ad-free players or with freemium off. Without AdSense configured it shows
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
      <span className="label">{t('premium.adLabel')}</span>
      {configured ? <AdUnit client={client} slot={slot} /> : <div className="placeholder">{t('premium.adLabel')}</div>}
      <Link href="/account#premium" className="remove">
        {t('premium.removeAds')}
      </Link>
    </aside>
  )
}
