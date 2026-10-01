import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MapPicker from '@/app/(protected)/(game)/components/MapPicker'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.chooseWhere') }
}

/** Second step of the main menu: the maps where the chosen game mode can be played. */
export default async function PlayModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: slug } = await params
  const t = await getT()
  const mode = getGameModes(t).find((item) => item.slug === slug)

  if (!mode) {
    notFound()
  }

  return <MapPicker mode={mode} maps={await getMaps()} />
}
