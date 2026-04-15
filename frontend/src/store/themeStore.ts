import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'leadpilot-theme-preference'

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function applyThemeToDocument(mode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
}

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* ignore */
  }
  return 'system'
}

/** Call before React render (with ``window``) to align with stored / system preference. */
export function initDocumentTheme() {
  if (typeof window === 'undefined') return
  const pref = readPreference()
  applyThemeToDocument(resolveTheme(pref))
}

type ThemeState = {
  preference: ThemePreference
  resolved: 'light' | 'dark'
  setPreference: (p: ThemePreference) => void
  syncResolved: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: typeof window !== 'undefined' ? readPreference() : 'system',
  resolved:
    typeof window !== 'undefined' ? resolveTheme(readPreference()) : 'light',

  setPreference(preference) {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* ignore */
    }
    const resolved = resolveTheme(preference)
    applyThemeToDocument(resolved)
    set({ preference, resolved })
  },

  syncResolved() {
    const resolved = resolveTheme(get().preference)
    applyThemeToDocument(resolved)
    set({ resolved })
  },
}))
