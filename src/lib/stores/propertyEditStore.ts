import { create } from 'zustand'
import { DatabaseProperty } from '../../interfaces'

interface PropertyEditState {
  property: DatabaseProperty | null
  setProperty: (property: DatabaseProperty) => void
  clearProperty: () => void
}

export const usePropertyEditStore = create<PropertyEditState>((set) => ({
  property: null,
  setProperty: (property: DatabaseProperty) => set({ property }),
  clearProperty: () => set({ property: null }),
}))
