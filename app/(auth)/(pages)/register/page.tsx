import type { Metadata } from 'next'
import RegisterForm from '@/app/(auth)/components/RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams

  return <RegisterForm callbackUrl={callbackUrl ?? null} />
}
