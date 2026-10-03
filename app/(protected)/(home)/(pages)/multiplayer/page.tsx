import type { Metadata } from 'next'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import MultiplayerMenu from '@/app/(protected)/(home)/components/MultiplayerMenu'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.multiplayer') }
}

export default async function MultiplayerPage() {
  const modes = getGameModes(await getT()).filter((mode) => mode.maxPlayers > 1)

  return <MultiplayerMenu modes={modes} />
}
