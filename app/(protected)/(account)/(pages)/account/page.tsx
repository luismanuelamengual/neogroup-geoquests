import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import AccountForm from '@/app/(protected)/(account)/components/AccountForm'
import { User } from '@/app/models/User'

export const metadata: Metadata = { title: 'Mi perfil' }

export default async function AccountPage() {
  const session = await auth()
  const userId = Number(session!.user.id)
  const user = await User.find(userId)

  return (
    <AccountForm
      account={{ name: user?.name ?? '', displayName: user?.displayName ?? '', email: user?.email ?? '' }}
    />
  )
}
