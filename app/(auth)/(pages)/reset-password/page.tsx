import type { Metadata } from 'next'
import AuthMessage from '@/app/(auth)/components/AuthMessage'
import ResetPasswordForm from '@/app/(auth)/components/ResetPasswordForm'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <AuthMessage
        title="Enlace inválido"
        severity="error"
        linkHref="/forgot-password"
        linkLabel="Pedir un enlace nuevo"
      >
        El enlace no es válido o ya fue utilizado.
      </AuthMessage>
    )
  }

  return <ResetPasswordForm token={token} />
}
