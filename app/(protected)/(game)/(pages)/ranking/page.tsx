import type { Metadata } from 'next'
import DailyRanking from '@/app/(protected)/(game)/components/DailyRanking'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('metadata.ranking') }
}

export default function RankingPage() {
  return <DailyRanking />
}
