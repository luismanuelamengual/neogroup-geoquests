'use client'

import Script from 'next/script'
import { createContext, ReactNode, useContext } from 'react'
import { AdsConfig } from '@/app/(protected)/(premium)/models/AdsConfig'

const NO_ADS: AdsConfig = { showAds: false, client: null, slot: null }
const AdsContext = createContext<AdsConfig>(NO_ADS)

/**
 * Gives the AdSlots whether this player sees ads (resolved on the server by the
 * protected layout) and loads the AdSense script only for those who do.
 */
export default function AdsProvider({ config, children }: { config: AdsConfig; children: ReactNode }) {
  return (
    <AdsContext.Provider value={config}>
      {config.showAds && config.client && (
        <Script
          id="adsense-script"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.client}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
      {children}
    </AdsContext.Provider>
  )
}

export function useAds(): AdsConfig {
  return useContext(AdsContext)
}
