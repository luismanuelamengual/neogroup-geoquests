import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GamePlay from '@/app/(protected)/(game)/components/GamePlay'

export const metadata: Metadata = { title: 'Jugando' }

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const gameId = Number((await params).id)

  if (!Number.isInteger(gameId) || gameId <= 0) {
    notFound()
  }

  return <GamePlay gameId={gameId} />
}
