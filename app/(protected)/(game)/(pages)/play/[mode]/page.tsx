import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import DetectiveIntro from '@/app/(protected)/(game)/components/DetectiveIntro'
import MapPicker from '@/app/(protected)/(game)/components/MapPicker'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { getModePath } from '@/app/(protected)/(game)/utils/modeRoutes'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.chooseWhere') }
}

/**
 * Second step of the "Jugar" menu: the rules and the maps of a single player
 * mode (the detective mode has its own page: it has no maps to choose). A
 * multiplayer mode is sent to its page in the "Multijugador" menu.
 */
export default async function PlayModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: slug } = await params
  const t = await getT()
  const mode = getGameModes(t).find((item) => item.slug === slug)

  if (!mode) {
    notFound()
  }

  if (mode.maxPlayers > 1) {
    redirect(getModePath(mode))
  }

  // Always played in the same map: no map picker.
  if (mode.mode === GameMode.DETECTIVE) {
    return <DetectiveIntro mode={mode} />
  }

  return <MapPicker mode={mode} maps={await getMaps()} />
}
