import type { Metadata } from 'next'
import MyGames from '@/app/(protected)/(game)/components/MyGames'

export const metadata: Metadata = { title: 'Mis partidas' }

export default function MyGamesPage() {
  return <MyGames />
}
