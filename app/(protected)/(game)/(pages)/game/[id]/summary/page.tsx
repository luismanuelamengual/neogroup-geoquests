import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GameSummary from '@/app/(protected)/(game)/components/GameSummary'

export const metadata: Metadata = { title: 'Resumen de la partida' }

export default async function GameSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const gameId = Number((await params).id)

  if (!Number.isInteger(gameId) || gameId <= 0) {
    notFound()
  }

  return <GameSummary gameId={gameId} />
}
