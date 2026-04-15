import { useEffect } from 'react'

import { useThemeStore } from '@/store/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((s) => s.preference)
  const syncResolved = useThemeStore((s) => s.syncResolved)

  useEffect(() => {
    syncResolved()
  }, [preference, syncResolved])

  useEffect(() => {
    if (preference !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => syncResolved()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [preference, syncResolved])

  return children
}
