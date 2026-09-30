import { create } from 'zustand'

const STORAGE_KEY = 'music:enabled'

interface MusicState {
  /** Whether the background music is on (saved in localStorage). */
  enabled: boolean
  /** Reads the saved preference (call it on the client, after mounting). */
  hydrate: () => void
  toggle: () => void
}

/** Preference of the background music: on by default, remembered across visits. */
export const useMusicStore = create<MusicState>()((set, get) => ({
  enabled: true,
  hydrate: () => {
    try {
      set({ enabled: window.localStorage.getItem(STORAGE_KEY) !== 'false' })
    } catch {
      // Storage disabled: keep the default.
    }
  },
  toggle: () => {
    const enabled = !get().enabled

    set({ enabled })

    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // Ignore write errors (e.g. storage disabled/full).
    }
  }
}))
