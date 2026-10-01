import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GameScreen from '@/app/(protected)/(game)/components/GameScreen'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.game') }
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const gameId = Number((await params).id)

  if (!Number.isInteger(gameId) || gameId <= 0) {
    notFound()
  }

  return <GameScreen gameId={gameId} />
}
