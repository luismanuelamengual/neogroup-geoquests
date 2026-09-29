import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QuestPicker from '@/app/(protected)/(game)/components/QuestPicker'
import { getGameModes, getQuests } from '@/app/(protected)/(game)/services/quests'

export const metadata: Metadata = { title: 'Elegí dónde jugar' }

/** Second step of the main menu: the quests where the chosen game mode can be played. */
export default async function PlayModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: slug } = await params
  const mode = (await getGameModes()).find((item) => item.slug === slug)

  if (!mode) {
    notFound()
  }

  return <QuestPicker mode={mode} quests={await getQuests(mode.mode)} />
}
