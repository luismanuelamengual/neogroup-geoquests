import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import MapPicker from '@/app/(protected)/(game)/components/MapPicker'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { getModePath } from '@/app/(protected)/(game)/utils/modeRoutes'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.chooseWhere') }
}

/**
 * Second step of the "Multijugador" menu: the rules and the maps of a
 * multiplayer mode. A single player mode is sent to its page in "Jugar".
 */
export default async function MultiplayerModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: slug } = await params
  const t = await getT()
  const mode = getGameModes(t).find((item) => item.slug === slug)

  if (!mode) {
    notFound()
  }

  if (mode.maxPlayers === 1) {
    redirect(getModePath(mode))
  }

  return <MapPicker mode={mode} maps={await getMaps()} />
}
