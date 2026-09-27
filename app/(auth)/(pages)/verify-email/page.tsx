import type { Metadata } from 'next'
import AuthMessage from '@/app/(auth)/components/AuthMessage'

export const metadata: Metadata = { title: 'Verificá tu email' }

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  if (error === 'expiredToken') {
    return (
      <AuthMessage title="Enlace vencido" severity="warning" linkHref="/register" linkLabel="Registrarme de nuevo">
        El enlace de verificación expiró. Registrate nuevamente con el mismo email y te mandamos uno nuevo.
      </AuthMessage>
    )
  }

  if (error) {
    return (
      <AuthMessage title="Enlace inválido" severity="error" linkHref="/register" linkLabel="Registrarme de nuevo">
        El enlace de verificación no es válido o ya fue utilizado.
      </AuthMessage>
    )
  }

  return (
    <AuthMessage title="Verificá tu email" severity="info">
      Revisá tu bandeja de entrada y hacé clic en el enlace de verificación para activar tu cuenta.
    </AuthMessage>
  )
}
