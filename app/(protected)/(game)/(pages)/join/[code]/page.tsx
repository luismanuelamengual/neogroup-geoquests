import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JoinGameInvitation from '@/app/(protected)/(game)/components/JoinGameInvitation'
import { normalizeGameCode } from '@/app/(protected)/(game)/utils/gameCodes'

export const metadata: Metadata = { title: 'Invitación' }

/** Invitation link of a multiplayer game. Protected like every page: without a session, login comes first. */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeGameCode((await params).code)

  if (!code) {
    notFound()
  }

  return <JoinGameInvitation code={code} />
}
