import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import HomeMenu from '@/app/(protected)/(home)/components/HomeMenu'

export const metadata: Metadata = { title: 'Menú principal' }

export default async function HomePage() {
  const session = await auth()
  const modes = getGameModes()

  return <HomeMenu playerName={session?.user?.name ?? ''} modes={modes} />
}
