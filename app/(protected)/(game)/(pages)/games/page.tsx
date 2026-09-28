import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import MyGames from '@/app/(protected)/(game)/components/MyGames'
import { getPlayerStats } from '@/app/(protected)/(game)/services/games'

export const metadata: Metadata = { title: 'Mis partidas' }

export default async function MyGamesPage() {
  const session = await auth()
  const stats = await getPlayerStats(Number(session!.user.id))

  return <MyGames stats={stats} />
}
