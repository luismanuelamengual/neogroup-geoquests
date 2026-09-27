'use client'

import '@/app/(auth)/components/LoginForm/index.scss'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/app/(auth)/hooks/useAuth'
import GameButton from '@/app/components/GameButton'

export default function ResetPasswordForm({ token }: { token: string }) {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')

      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      router.push('/login?passwordReset=1')
    } catch (requestError) {
      setError((requestError as Error).message || 'Algo salió mal. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <Typography variant="h5" component="h1" className="title">
        Nueva contraseña
      </Typography>
      <form onSubmit={handleSubmit} className="form">
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <GameButton type="submit" fullWidth loading={loading}>
          Guardar contraseña
        </GameButton>
      </form>
    </div>
  )
}
