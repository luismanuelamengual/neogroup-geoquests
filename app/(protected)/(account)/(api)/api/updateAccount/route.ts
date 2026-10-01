import { cookies } from 'next/headers'
import { unstable_update } from '@/app/(auth)/services/auth'
import { AccountInput } from '@/app/(protected)/(account)/models/AccountInput'
import { isLocale, LOCALE_COOKIE } from '@/app/i18n/config'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'
import { withAuth } from '@/app/utils/api-server'
import { normalizeName } from '@/app/utils/users'

const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60

/** POST /api/updateAccount — updates the player name and/or the language of the signed-in user. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as AccountInput
  const user = await User.find(userId)

  if (!user) {
    throw new ApiException('errors.notAuthenticated', 401)
  }

  if (input.name !== undefined) {
    const name = normalizeName(String(input.name ?? ''))

    if (!name) {
      throw new ApiException('errors.playerNameRequired')
    }

    if (name.length > 40) {
      throw new ApiException('errors.playerNameTooLong')
    }

    user.name = name
  }

  if (input.locale !== undefined) {
    if (!isLocale(input.locale)) {
      throw new ApiException('errors.invalidLocale')
    }

    user.locale = input.locale
    // Also remembered in a cookie: the pages shown before signing in use it.
    ;(await cookies()).set(LOCALE_COOKIE, input.locale, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax'
    })
  }

  await user.save()
  // Refresh the session token so the new name and language are used everywhere.
  await unstable_update({})

  return { name: user.name, displayName: user.displayName, locale: user.locale }
})
