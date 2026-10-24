import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import AchievementsPage from '@/app/(protected)/(account)/components/AchievementsPage'
import { getAchievements } from '@/app/(protected)/(game)/services/achievements'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.achievements') }
}

export default async function PlayerAchievementsPage() {
  const session = await auth()
  const medals = await getAchievements(Number(session!.user.id))

  return <AchievementsPage medals={medals} />
}
