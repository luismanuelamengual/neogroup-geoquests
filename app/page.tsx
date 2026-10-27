import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/app/(auth)/services/auth'
import LandingPage from '@/app/(public)/components/LandingPage'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getT } from '@/app/i18n/server'
import { resolveCallbackPath } from '@/app/utils/urls'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({
    title: t('metadata.homeTitle'),
    description: t('metadata.homeDescription'),
    path: '/',
    absoluteTitle: true
  })
}

/**
 * Entry point: signed-in players go straight to the main menu (or to the
 * `callbackUrl` they were heading to), everybody else sees the public landing.
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth()

  if (!session?.user) {
    return <LandingPage />
  }

  const { callbackUrl } = await searchParams

  redirect(resolveCallbackPath(callbackUrl) ?? '/play')
}
