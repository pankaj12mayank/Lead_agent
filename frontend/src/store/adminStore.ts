import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminState = {
  token: string | null
  setToken: (t: string | null) => void
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
      logout: () => set({ token: null }),
    }),
    { name: 'leadpilot-admin' },
  ),
)
