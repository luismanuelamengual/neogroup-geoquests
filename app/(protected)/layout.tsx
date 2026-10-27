import { redirect } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { auth } from '@/app/(auth)/services/auth'
import AdsProvider from '@/app/(protected)/(ads)/components/AdsProvider'
import { getAdsConfig } from '@/app/(protected)/(ads)/services/ads'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import AppShell from '@/app/(protected)/components/AppShell'
import TimeZoneSync from '@/app/(protected)/components/TimeZoneSync'
import UserStoreHydrator from '@/app/(protected)/components/UserStoreHydrator'
import { SessionUser } from '@/app/(protected)/models/SessionUser'
import Loading from '@/app/components/Loading'
import { User } from '@/app/models/User'

/**
 * Shared layout for every authenticated page: requires a session whose user
 * still exists and is active, hydrates the user store, keeps its time zone up
 * to date and wraps the content with the application shell (with its streak)
 * and the ads (see app/(protected)/(ads)).
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
    lastName: dbUser.lastName,
    nickname: dbUser.nickname,
    displayName: dbUser.displayName
  }
  const stats = await getPlayerStats(dbUser.id)

  return (
    <AdsProvider config={getAdsConfig(dbUser)}>
      <UserStoreHydrator user={user} />
      <TimeZoneSync timeZone={dbUser.timeZone} />
      <AppShell user={user} stats={stats}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </AppShell>
    </AdsProvider>
  )
}
