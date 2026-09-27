import type { Metadata } from 'next'
import LoginForm from '@/app/(auth)/components/LoginForm'

export const metadata: Metadata = { title: 'Ingresar' }

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string; passwordReset?: string }>
}) {
  const { callbackUrl, verified, passwordReset } = await searchParams

  return (
    <LoginForm callbackUrl={callbackUrl ?? null} verified={verified === '1'} passwordReset={passwordReset === '1'} />
  )
}
