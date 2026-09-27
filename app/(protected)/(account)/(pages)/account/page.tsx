import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import AccountForm from '@/app/(protected)/(account)/components/AccountForm'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import { User } from '@/app/models/User'

export const metadata: Metadata = { title: 'Mi perfil' }

export default async function AccountPage() {
  const session = await auth()
  const userId = Number(session!.user.id)
  const [stats, user] = await Promise.all([getPlayerStats(userId), User.find(userId)])

  return (
    <AccountForm
      stats={stats}
      account={{ name: user?.name ?? '', displayName: user?.displayName ?? '', email: user?.email ?? '' }}
    />
  )
}
