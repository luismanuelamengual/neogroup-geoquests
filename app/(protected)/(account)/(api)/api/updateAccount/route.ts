import { unstable_update } from '@/app/(auth)/services/auth'
import { AccountInput } from '@/app/(protected)/(account)/models/AccountInput'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'
import { withAuth } from '@/app/utils/api-server'
import { normalizeName } from '@/app/utils/users'

/** POST /api/updateAccount — updates the player name of the signed-in user. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as AccountInput
  const name = normalizeName(String(input.name ?? ''))

  if (!name) {
    throw new ApiException('Elegí un nombre de jugador')
  }

  if (name.length > 40) {
    throw new ApiException('El nombre de jugador puede tener hasta 40 caracteres')
  }

  const user = await User.find(userId)

  if (!user) {
    throw new ApiException('Usuario no autenticado', 401)
  }

  user.name = name
  await user.save()
  // Refresh the session token so the new name is used everywhere.
  await unstable_update({})

  return { name: user.name, displayName: user.displayName }
})
