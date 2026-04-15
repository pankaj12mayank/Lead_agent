import { create } from 'zustand'

import type { User } from '@/types/models'

const TOKEN_KEY = 'li_token'
const USER_KEY = 'li_user'

type AuthState = {
  token: string | null
  user: User | null
  hydrate: () => void
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrate: () => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY)
      const raw = sessionStorage.getItem(USER_KEY)
      if (t && raw) {
        const user = JSON.parse(raw) as User
        set({ token: t, user })
      }
    } catch {
      /* ignore */
    }
  },
  setAuth: (token, user) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },
}))
