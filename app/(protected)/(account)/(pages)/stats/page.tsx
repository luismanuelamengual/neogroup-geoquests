import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import StatsPage from '@/app/(protected)/(account)/components/StatsPage'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.stats') }
}

export default async function PlayerStatsPage() {
  const session = await auth()

  return <StatsPage stats={await getPlayerStats(Number(session!.user.id))} />
}
