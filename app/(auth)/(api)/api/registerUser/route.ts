import bcrypt from 'bcryptjs'
import { RegisterInput } from '@/app/(auth)/models/RegisterInput'
import { sendVerificationEmail } from '@/app/(auth)/services/tokens'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'
import { withApi } from '@/app/utils/api-server'
import { isValidEmail, normalizeName } from '@/app/utils/users'

const MIN_PASSWORD_LENGTH = 6

/** POST /api/registerUser — creates a player with email/password and emails the verification link (public). */
export const POST = withApi(async (request) => {
  const input = (await request.json()) as RegisterInput
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase()
  const password = String(input.password ?? '')
  const name = normalizeName(String(input.name ?? ''))

  if (!isValidEmail(email)) {
    throw new ApiException('El email no es válido')
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiException(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  if (!name) {
    throw new ApiException('Elegí un nombre de jugador')
  }

  if (name.length > 40) {
    throw new ApiException('El nombre de jugador puede tener hasta 40 caracteres')
  }

  const existing = await User.where('email', email).first()

  if (existing?.emailVerified) {
    throw new ApiException('El email ya está registrado')
  }

  // An unverified account can be registered again (e.g. the verification mail
  // expired): its data is replaced and a new link is sent.
  const user = existing ?? new User()

  user.email = email
  user.passwordHash = await bcrypt.hash(password, 10)
  user.name = name
  user.emailVerified = false
  user.active = true
  await user.save()

  await sendVerificationEmail(user, request.headers.get('host') ?? '')

  return { id: user.id }
})
