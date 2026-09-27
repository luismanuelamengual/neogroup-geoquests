'use client'

import '@/app/(auth)/components/LoginForm/index.scss'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/app/(auth)/hooks/useAuth'
import GameButton from '@/app/components/GameButton'

export default function RegisterForm({ callbackUrl }: { callbackUrl: string | null }) {
  const { registerUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const loginHref = `/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')

      return
    }

    setLoading(true)

    try {
      await registerUser({ name, email, password })
      setRegistered(true)
    } catch (requestError) {
      setError((requestError as Error).message || 'Algo salió mal. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="auth-form">
        <Typography variant="h5" component="h1" className="title">
          Verificá tu email
        </Typography>
        <Alert severity="success">
          Te enviamos un enlace de verificación a {email}. Revisá tu bandeja de entrada y hacé clic para activar tu
          cuenta.
        </Alert>
        <Typography variant="body2" className="footer">
          ¿Ya la activaste?{' '}
          <Link href={loginHref} className="text-link">
            Ingresar
          </Link>
        </Typography>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <Typography variant="h5" component="h1" className="title">
        Crear cuenta
      </Typography>
      <form onSubmit={handleSubmit} className="form">
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nombre de jugador"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          fullWidth
          autoComplete="nickname"
          slotProps={{ htmlInput: { maxLength: 40 }, inputLabel: { shrink: true } }}
        />
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
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          helperText="Mínimo 6 caracteres"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Repetir contraseña"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          error={passwordsMismatch}
          helperText={passwordsMismatch ? 'Las contraseñas no coinciden' : ' '}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <GameButton type="submit" fullWidth loading={loading}>
          Crear cuenta
        </GameButton>
      </form>
      <Typography variant="body2" className="footer">
        ¿Ya tenés cuenta?{' '}
        <Link href={loginHref} className="text-link">
          Ingresar
        </Link>
      </Typography>
    </div>
  )
}
