import { create } from 'zustand'

export type LeadsFilters = {
  search: string
  tier: string
  platform: string
  status: string
}

type LeadsUiState = {
  filters: LeadsFilters
  setSearch: (v: string) => void
  setTier: (v: string) => void
  setPlatform: (v: string) => void
  setStatus: (v: string) => void
  resetFilters: () => void
}

const initial: LeadsFilters = {
  search: '',
  tier: '',
  platform: '',
  status: '',
}

export const useLeadsUiStore = create<LeadsUiState>((set) => ({
  filters: initial,
  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
  setTier: (tier) => set((s) => ({ filters: { ...s.filters, tier } })),
  setPlatform: (platform) => set((s) => ({ filters: { ...s.filters, platform } })),
  setStatus: (status) => set((s) => ({ filters: { ...s.filters, status } })),
  resetFilters: () => set({ filters: initial }),
}))
