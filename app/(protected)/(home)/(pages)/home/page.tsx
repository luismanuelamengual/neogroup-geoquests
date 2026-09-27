import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import HomeMenu from '@/app/(protected)/(home)/components/HomeMenu'

export const metadata: Metadata = { title: 'Menú principal' }

export default async function HomePage() {
  const session = await auth()

  return <HomeMenu playerName={session?.user?.name ?? ''} />
}
