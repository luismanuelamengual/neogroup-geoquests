'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('focus', onChange)
  window.addEventListener('blur', onChange)
  document.addEventListener('visibilitychange', onChange)

  return () => {
    window.removeEventListener('focus', onChange)
    window.removeEventListener('blur', onChange)
    document.removeEventListener('visibilitychange', onChange)
  }
}

/**
 * The page counts as focused while its tab is visible and the focus is in it.
 * `document.hasFocus()` (not just the blur event) keeps it focused when the
 * focus moves into one of its iframes (e.g. Street View).
 */
function getSnapshot() {
  return !document.hidden && document.hasFocus()
}

/** On the server there is no window: rendered as focused. */
function getServerSnapshot() {
  return true
}

/**
 * Whether the app's window is the active one: false while the tab is hidden
 * or the focus is somewhere else (another app, another window). Used to pause
 * the polling while nobody is looking at the app.
 */
export function useFocusDetector(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
