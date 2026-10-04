import { notFound } from 'next/navigation'
import WitnessGallery from '@/app/(protected)/(game)/components/WitnessGallery'

/** Development only: review the witnesses of the detective mode (/dev/witnesses). */
export default function WitnessesPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const seeds = Array.from({ length: 30 }, () => Math.floor(Math.random() * 2 ** 31))

  return <WitnessGallery initialSeeds={seeds} />
}
