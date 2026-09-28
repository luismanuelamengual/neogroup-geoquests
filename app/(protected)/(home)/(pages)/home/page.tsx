import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import { getQuests } from '@/app/(protected)/(game)/services/quests'
import HomeMenu from '@/app/(protected)/(home)/components/HomeMenu'

export const metadata: Metadata = { title: 'Menú principal' }

export default async function HomePage() {
  const [session, quests] = await Promise.all([auth(), getQuests()])

  return <HomeMenu playerName={session?.user?.name ?? ''} quests={quests} />
}
