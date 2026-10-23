import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import ProgressPage from '@/app/(protected)/(account)/components/ProgressPage'
import { getAchievements } from '@/app/(protected)/(game)/services/achievements'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.progress') }
}

export default async function PlayerProgressPage() {
  const session = await auth()
  const userId = Number(session!.user.id)
  const [stats, medals] = await Promise.all([getPlayerStats(userId), getAchievements(userId)])

  return <ProgressPage stats={stats} medals={medals} />
}
