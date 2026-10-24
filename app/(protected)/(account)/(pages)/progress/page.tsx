import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import ProgressPage from '@/app/(protected)/(account)/components/ProgressPage'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.progress') }
}

export default async function PlayerProgressPage() {
  const session = await auth()
  const userId = Number(session!.user.id)
  const stats = await getPlayerStats(userId)

  return <ProgressPage stats={stats} />
}
