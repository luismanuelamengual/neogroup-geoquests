import { randomBytes } from 'crypto'
import { EmailVerificationToken } from '@/app/(auth)/models/EmailVerificationToken'
import { PasswordResetToken } from '@/app/(auth)/models/PasswordResetToken'
import { User } from '@/app/models/User'
import { renderActionEmail, sendEmail } from '@/app/utils/email'
import { resolveAppUrl } from '@/app/utils/urls'
import { getUserDisplayName } from '@/app/utils/users'

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24
const RESET_TOKEN_EXPIRY_HOURS = 1

function createToken(): string {
  return randomBytes(32).toString('hex')
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

/**
 * Issues a fresh email verification token for `user` (invalidating any
 * previous one) and emails them the activation link.
 */
export async function sendVerificationEmail(user: User, host: string): Promise<void> {
  for (const previousToken of await EmailVerificationToken.where('userId', user.id).get()) {
    await previousToken.delete()
  }

  const token = new EmailVerificationToken()

  token.userId = user.id
  token.token = createToken()
  token.expiresAt = hoursFromNow(VERIFICATION_TOKEN_EXPIRY_HOURS)
  await token.save()

  await sendEmail({
    to: user.email,
    subject: 'Activá tu cuenta de GeoQuests',
    html: renderActionEmail({
      title: `¡Hola ${getUserDisplayName(user)}!`,
      intro: 'Gracias por sumarte a GeoQuests. Para activar tu cuenta y empezar a jugar, verificá tu email:',
      actionLabel: 'Verificar mi email',
      actionUrl: `${resolveAppUrl(host)}/api/verifyEmail?token=${token.token}`,
      footer: `El enlace es válido por ${VERIFICATION_TOKEN_EXPIRY_HOURS} horas. Si no creaste esta cuenta, ignorá este mensaje.`
    })
  })
}

/**
 * Issues a fresh password reset token for `user` (only one valid at a time)
 * and emails them the link to set a new password.
 */
export async function sendPasswordResetEmail(user: User, host: string): Promise<void> {
  for (const previousToken of await PasswordResetToken.where('userId', user.id).get()) {
    await previousToken.delete()
  }

  const token = new PasswordResetToken()

  token.userId = user.id
  token.token = createToken()
  token.expiresAt = hoursFromNow(RESET_TOKEN_EXPIRY_HOURS)
  await token.save()

  await sendEmail({
    to: user.email,
    subject: 'Restablecer tu contraseña de GeoQuests',
    html: renderActionEmail({
      title: `¡Hola ${getUserDisplayName(user)}!`,
      intro: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de GeoQuests.',
      actionLabel: 'Restablecer contraseña',
      actionUrl: `${resolveAppUrl(host)}/reset-password?token=${token.token}`,
      footer: `El enlace es válido por ${RESET_TOKEN_EXPIRY_HOURS} hora. Si no pediste este cambio, ignorá este mensaje.`
    })
  })
}
