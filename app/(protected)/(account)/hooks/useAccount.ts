'use client'

import { useCallback } from 'react'
import { AccountInput } from '@/app/(protected)/(account)/models/AccountInput'
import { useRequests } from '@/app/hooks/useRequests'
import type { Locale } from '@/app/i18n/config'

export function useAccount() {
  const executeRequest = useRequests()
  const updateAccount = useCallback(
    (input: AccountInput) =>
      executeRequest<{ name: string; displayName: string; locale: Locale }>('/updateAccount', input),
    [executeRequest]
  )

  return { updateAccount }
}
