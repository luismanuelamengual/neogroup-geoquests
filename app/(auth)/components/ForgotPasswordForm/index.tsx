'use client'

import '@/app/(auth)/components/LoginForm/index.scss'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/app/(auth)/hooks/useAuth'
import GameButton from '@/app/components/GameButton'

export default function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      await requestPasswordReset(email)
    } catch {
      // Silently ignored to avoid user enumeration.
    }

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="auth-form">
      <Typography variant="h5" component="h1" className="title">
        Recuperar contraseña
      </Typography>
      {sent ? (
        <Alert severity="success">
          Si existe una cuenta asociada a {email}, vas a recibir un correo con instrucciones para restablecer tu
          contraseña.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" className="subtitle">
            Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
          </Typography>
          <form onSubmit={handleSubmit} className="form">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              autoComplete="email"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <GameButton type="submit" fullWidth loading={loading}>
              Enviar enlace
            </GameButton>
          </form>
        </>
      )}
      <Typography variant="body2" className="footer">
        <Link href="/login" className="text-link">
          Volver a ingresar
        </Link>
      </Typography>
    </div>
  )
}
