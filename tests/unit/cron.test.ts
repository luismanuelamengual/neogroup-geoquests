import { describe, expect, it } from 'vitest'
import { isAuthorizedCronRequest } from '@/app/utils/cron'

describe('cron requests', () => {
  it('accepts only the configured secret as a bearer token', () => {
    expect(isAuthorizedCronRequest('Bearer s3cret', 's3cret')).toBe(true)
    expect(isAuthorizedCronRequest('Bearer other', 's3cret')).toBe(false)
    expect(isAuthorizedCronRequest('s3cret', 's3cret')).toBe(false)
    expect(isAuthorizedCronRequest(null, 's3cret')).toBe(false)
  })

  it('rejects everything when no secret is configured', () => {
    expect(isAuthorizedCronRequest('Bearer ', '')).toBe(false)
    expect(isAuthorizedCronRequest('Bearer undefined', undefined)).toBe(false)
  })
})
