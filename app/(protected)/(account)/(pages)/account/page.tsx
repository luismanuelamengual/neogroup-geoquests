import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import AccountForm from '@/app/(protected)/(account)/components/AccountForm'
import PremiumPanel from '@/app/(protected)/(premium)/components/PremiumPanel'
import { isAdFree, isFreemiumEnabled, PREMIUM_PRICE_LABEL } from '@/app/(protected)/(premium)/services/premium'
import { getT } from '@/app/i18n/server'
import { User } from '@/app/models/User'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.profile') }
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const session = await auth()
  const userId = Number(session!.user.id)
  const user = await User.find(userId)
  const { upgraded } = await searchParams

  return (
    <AccountForm account={{ name: user?.name ?? '', displayName: user?.displayName ?? '', email: user?.email ?? '' }}>
      {user && isFreemiumEnabled() && (
        <PremiumPanel
          premiumUntil={user.premiumUntil?.toISOString() ?? null}
          adFree={isAdFree(user)}
          price={PREMIUM_PRICE_LABEL}
          upgraded={upgraded === '1'}
        />
      )}
    </AccountForm>
  )
}
