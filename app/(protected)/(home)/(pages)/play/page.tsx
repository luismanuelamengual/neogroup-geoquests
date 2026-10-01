import type { Metadata } from 'next'
import { auth } from '@/app/(auth)/services/auth'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import HomeMenu from '@/app/(protected)/(home)/components/HomeMenu'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.mainMenu') }
}

export default async function HomePage() {
  const session = await auth()
  const modes = getGameModes(await getT())

  return <HomeMenu playerName={session?.user?.name ?? ''} modes={modes} />
}
