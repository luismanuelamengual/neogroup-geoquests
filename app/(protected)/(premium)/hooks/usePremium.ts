'use client'

import { useCallback } from 'react'
import { useRequests } from '@/app/hooks/useRequests'

export function usePremium() {
  const executeRequest = useRequests()
  const createCheckout = useCallback(() => executeRequest<{ url: string }>('/createCheckout'), [executeRequest])

  return { createCheckout }
}
