import { redirect } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { auth } from '@/app/(auth)/services/auth'
import AdsProvider from '@/app/(protected)/(premium)/components/AdsProvider'
import { AdsConfig } from '@/app/(protected)/(premium)/models/AdsConfig'
import { shouldShowAds } from '@/app/(protected)/(premium)/services/premium'
import AppShell from '@/app/(protected)/components/AppShell'
import UserStoreHydrator from '@/app/(protected)/components/UserStoreHydrator'
import { SessionUser } from '@/app/(protected)/models/SessionUser'
import Loading from '@/app/components/Loading'
import { User } from '@/app/models/User'

/**
 * Shared layout for every authenticated page: requires a session whose user
 * still exists and is active, hydrates the user store and wraps the content
 * with the application shell and the ads of the free players (freemium).
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const dbUser = await User.find(Number(session.user.id))

  if (!dbUser || !dbUser.active) {
    // Clearing the session cookie is only allowed in Route Handlers.
    redirect('/api/signout')
  }

  const user: SessionUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    displayName: dbUser.displayName
  }
  const ads: AdsConfig = {
    showAds: shouldShowAds(dbUser),
    client: process.env.ADSENSE_CLIENT_ID || null,
    slot: process.env.ADSENSE_SLOT_ID || null
  }

  return (
    <AdsProvider config={ads}>
      <UserStoreHydrator user={user} />
      <AppShell user={user}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </AppShell>
    </AdsProvider>
  )
}
