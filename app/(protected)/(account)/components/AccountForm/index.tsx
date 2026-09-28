'use client'

import './index.scss'
import TextField from '@mui/material/TextField'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useAccount } from '@/app/(protected)/(account)/hooks/useAccount'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import PlayerAvatar from '@/app/components/PlayerAvatar'
import { useNotifications } from '@/app/hooks/useNotifications'

/** Player profile: badge and the player name form. */
interface AccountFormProps {
  account: { name: string; displayName: string; email: string }
}

export default function AccountForm({ account }: AccountFormProps) {
  const router = useRouter()
  const { updateAccount } = useAccount()
  const { showSuccessMessage } = useNotifications()
  const [profile, setProfile] = useState(account)
  const [name, setName] = useState(account.name)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const updated = await updateAccount({ name })
      const user = useUserStore.getState().user

      setProfile({ ...profile, ...updated })

      // Keep the app bar badge in sync.
      if (user) {
        useUserStore.setState({ user: { ...user, ...updated } })
      }

      showSuccessMessage('¡Nombre actualizado!')
      router.refresh()
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-page">
      <GamePanel className="profile" title="Mi perfil">
        <div className="badge">
          <PlayerAvatar name={profile.displayName || '?'} className="avatar" />
          <div>
            <div className="name">{profile.displayName}</div>
            <div className="email">{profile.email}</div>
          </div>
        </div>
      </GamePanel>
      <GamePanel className="settings" title="Nombre de jugador" accent="cyan">
        <form onSubmit={handleSubmit} className="form">
          <TextField
            label="Nombre de jugador"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 40 }, inputLabel: { shrink: true } }}
          />
          <GameButton type="submit" color="cyan" loading={saving}>
            Guardar
          </GameButton>
        </form>
      </GamePanel>
    </div>
  )
}
