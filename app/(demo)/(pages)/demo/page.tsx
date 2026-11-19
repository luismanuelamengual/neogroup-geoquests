import type { Metadata } from 'next'
import DemoGame from '@/app/(demo)/components/DemoGame'
import { getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  // A game screen, not content: reachable from the landing but out of the search results.
  return { title: t('demo.title'), robots: { index: false, follow: true } }
}

/** Trial game without an account (see app/(demo)/services/demo.ts). */
export default function DemoPage() {
  return <DemoGame />
}
