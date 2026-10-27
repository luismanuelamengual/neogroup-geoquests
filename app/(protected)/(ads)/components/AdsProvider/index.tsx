'use client'

import { createContext, ReactNode, useContext } from 'react'
import { AdsConfig } from '@/app/(protected)/(ads)/models/AdsConfig'

const NO_ADS: AdsConfig = { showAds: false, client: null, slot: null }
const AdsContext = createContext<AdsConfig>(NO_ADS)

/**
 * Gives the AdSlots whether this player sees ads (resolved on the server by the
 * protected layout and by the layout of the public pages). The AdSense script
 * is loaded by the AdSlots themselves, so it is never on a page without one
 * (login, game screens…).
 */
export default function AdsProvider({ config, children }: { config: AdsConfig; children: ReactNode }) {
  return <AdsContext.Provider value={config}>{children}</AdsContext.Provider>
}

export function useAds(): AdsConfig {
  return useContext(AdsContext)
}
