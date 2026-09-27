'use client'

import { useCallback } from 'react'
import { AccountInput } from '@/app/(protected)/(account)/models/AccountInput'
import { useRequests } from '@/app/hooks/useRequests'

export function useAccount() {
  const executeRequest = useRequests()
  const updateAccount = useCallback(
    (input: AccountInput) => executeRequest<{ name: string; displayName: string }>('/updateAccount', input),
    [executeRequest]
  )

  return { updateAccount }
}
