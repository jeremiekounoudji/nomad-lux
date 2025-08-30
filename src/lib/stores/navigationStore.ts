import { create } from 'zustand'
import { ROUTES } from '../../router/types'

interface NavigationState {
  // State
  currentRoute: string
  previousRoute: string | null
  returnUrl: string | null
  isDrawerOpen: boolean
  
  // Actions
  setCurrentRoute: (route: string) => void
  setReturnUrl: (url: string | null) => void
  toggleDrawer: (isOpen?: boolean) => void
  clearNavigation: () => void
}

export const useNavigationStore = create<NavigationState>()((set, get) => ({
  // Initial state
  currentRoute: ROUTES.HOME,
  previousRoute: null,
  returnUrl: null,
  isDrawerOpen: false,

  // Actions
  setCurrentRoute: (route) => {
    console.log('🧭 NavigationStore: Route change:', {
      from: get().currentRoute,
      to: route
    })
    set((state) => ({
      previousRoute: state.currentRoute,
      currentRoute: route
    }))
  },

  setReturnUrl: (url) => {
    console.log('🧭 NavigationStore: Setting return URL:', url)
    set({ returnUrl: url })
  },

  toggleDrawer: (isOpen) => {
    const newState = typeof isOpen === 'boolean' ? isOpen : !get().isDrawerOpen
    console.log('🧭 NavigationStore: Toggling drawer:', { isOpen: newState })
    set({ isDrawerOpen: newState })
  },

  clearNavigation: () => {
    console.log('🧭 NavigationStore: Clearing navigation state')
    set({
      currentRoute: ROUTES.HOME,
      previousRoute: null,
      returnUrl: null,
      isDrawerOpen: false
    })
  }
})) 