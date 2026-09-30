import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MapPicker from '@/app/(protected)/(game)/components/MapPicker'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { getMaps } from '@/app/(protected)/(game)/services/maps'

export const metadata: Metadata = { title: 'Elegí dónde jugar' }

/** Second step of the main menu: the maps where the chosen game mode can be played. */
export default async function PlayModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: slug } = await params
  const mode = getGameModes().find((item) => item.slug === slug)

  if (!mode) {
    notFound()
  }

  return <MapPicker mode={mode} maps={await getMaps()} />
}
