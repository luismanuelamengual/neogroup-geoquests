import type { Metadata } from 'next'
import ForgotPasswordForm from '@/app/(auth)/components/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
