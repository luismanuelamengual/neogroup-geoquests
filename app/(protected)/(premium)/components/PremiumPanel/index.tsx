'use client'

import './index.scss'
import BlockIcon from '@mui/icons-material/Block'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePremium } from '@/app/(protected)/(premium)/hooks/usePremium'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import { LOCALE_TAGS } from '@/app/i18n/config'
import { useI18n } from '@/app/i18n/I18nProvider'

const CONFIRMATION_POLL_MS = 3000
const CONFIRMATION_MAX_POLLS = 20

interface PremiumPanelProps {
  /** Until when the player plays without ads (ISO date), or null if it never paid. */
  premiumUntil: string | null
  adFree: boolean
  price: string
  /** Back from the checkout (/account?upgraded=1). */
  upgraded: boolean
}

/**
 * "Play without ads" panel of the profile: the ad-free time left and the button
 * to buy (or add) a year. Coming back from the checkout, the payment is
 * confirmed by the webhook a moment later: the page refreshes until it is.
 */
export default function PremiumPanel({ premiumUntil, adFree, price, upgraded }: PremiumPanelProps) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { createCheckout } = usePremium()
  const [buying, setBuying] = useState(false)
  const [polls, setPolls] = useState(0)
  const confirming = upgraded && !adFree && polls < CONFIRMATION_MAX_POLLS
  const date = premiumUntil
    ? new Intl.DateTimeFormat(LOCALE_TAGS[locale], { dateStyle: 'long' }).format(new Date(premiumUntil))
    : null

  useEffect(() => {
    if (!confirming) {
      return
    }

    const timer = setTimeout(() => {
      setPolls((count) => count + 1)
      router.refresh()
    }, CONFIRMATION_POLL_MS)

    return () => clearTimeout(timer)
  }, [confirming, polls, router])

  const handleBuy = async () => {
    setBuying(true)

    try {
      const { url } = await createCheckout()

      window.location.href = url
    } catch {
      // The error toast is shown by useRequests.
      setBuying(false)
    }
  }

  return (
    <GamePanel id="premium" className="premium-panel" title={t('premium.title')} accent="magenta">
      {adFree ? (
        <>
          {upgraded && <p className="thanks">{t('premium.thanks')}</p>}
          <p className="status">{t('premium.activeUntil', { date: date! })}</p>
        </>
      ) : (
        <>
          {confirming && <p className="status">{t('premium.confirming')}</p>}
          {!confirming && date && <p className="status">{t('premium.expired', { date })}</p>}
          <p className="pitch">{t('premium.pitch', { price })}</p>
        </>
      )}
      <p className="note">{t('premium.oneOffNote')}</p>
      <GameButton color="magenta" fullWidth loading={buying} startIcon={<BlockIcon />} onClick={handleBuy}>
        {adFree ? t('premium.addYear', { price }) : t('premium.buy', { price })}
      </GameButton>
    </GamePanel>
  )
}
