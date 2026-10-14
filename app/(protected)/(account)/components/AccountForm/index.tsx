'use client'

import './index.scss'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useAccount } from '@/app/(protected)/(account)/hooks/useAccount'
import { useUserStore } from '@/app/(protected)/stores/users'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import PlayerAvatar from '@/app/components/PlayerAvatar'
import { useNotifications } from '@/app/hooks/useNotifications'
import { isLocale, Locale, LOCALE_FLAGS, LOCALE_NAMES, LOCALES } from '@/app/i18n/config'
import { useI18n } from '@/app/i18n/I18nProvider'
import { createTranslator } from '@/app/i18n/translate'

/** Player profile: a single panel with the badge and every setting, saved together with one button. */
interface AccountFormProps {
  account: { name: string; displayName: string; email: string }
}

export default function AccountForm({ account }: AccountFormProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { updateAccount } = useAccount()
  const { showSuccessMessage } = useNotifications()
  const [profile, setProfile] = useState(account)
  const [name, setName] = useState(account.name)
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const updated = await updateAccount({ name, locale: selectedLocale })
      const user = useUserStore.getState().user

      setProfile({ ...profile, name: updated.name, displayName: updated.displayName })

      // Keep the app bar badge in sync.
      if (user) {
        useUserStore.setState({ user: { ...user, name: updated.name, displayName: updated.displayName } })
      }

      // The page still runs in the old language until the refresh arrives: confirm in the saved one.
      showSuccessMessage(createTranslator(updated.locale)('account.saved'))
      router.refresh()
    } catch {
      // The error toast is shown by useRequests.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-page">
      <GamePanel className="profile" title={t('account.profile')}>
        <div className="badge">
          <PlayerAvatar name={profile.displayName || '?'} className="avatar" />
          <div>
            <div className="name">{profile.displayName}</div>
            <div className="email">{profile.email}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <TextField
            label={t('account.playerNameTitle')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 40 }, inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label={t('account.languageLabel')}
            value={selectedLocale}
            onChange={(event) => isLocale(event.target.value) && setSelectedLocale(event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {LOCALES.map((option) => (
              <MenuItem key={option} value={option}>
                {LOCALE_FLAGS[option]} {LOCALE_NAMES[option]}
              </MenuItem>
            ))}
          </TextField>
          <GameButton type="submit" color="cyan" fullWidth loading={saving}>
            {t('account.save')}
          </GameButton>
        </form>
      </GamePanel>
    </div>
  )
}
