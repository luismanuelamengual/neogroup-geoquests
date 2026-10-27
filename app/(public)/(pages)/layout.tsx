import './layout.scss'
import { ReactNode } from 'react'
import { auth } from '@/app/(auth)/services/auth'
import AdsProvider from '@/app/(protected)/(ads)/components/AdsProvider'
import { getAdsConfig } from '@/app/(protected)/(ads)/services/ads'
import PublicFooter from '@/app/(public)/components/PublicFooter'
import PublicHeader from '@/app/(public)/components/PublicHeader'
import GamePanel from '@/app/components/GamePanel'
import { User } from '@/app/models/User'

/**
 * Layout of the public pages that are read rather than played (rules, guides,
 * about, contact, legal pages): the public header and footer around a framed
 * panel. Signed in or not; the ads follow the player's exemption when there is one.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth()
  const user = session?.user?.id ? await User.find(Number(session.user.id)) : null

  return (
    <AdsProvider config={getAdsConfig(user)}>
      <div className="public-layout">
        <PublicHeader signedIn={!!user} />
        <main className="content">
          <GamePanel className="card">{children}</GamePanel>
        </main>
        <PublicFooter />
      </div>
    </AdsProvider>
  )
}
