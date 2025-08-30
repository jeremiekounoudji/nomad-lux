import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNavigationStore } from '../lib/stores/navigationStore'
import { useAuthStore } from '../lib/stores/authStore'
import { ROUTES } from '../router/types'

export const useNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const {
    currentRoute,
    previousRoute,
    returnUrl,
    isDrawerOpen,
    setCurrentRoute,
    setReturnUrl,
    toggleDrawer,
    clearNavigation
  } = useNavigationStore()

  // Update current route on location change
  useEffect(() => {
    setCurrentRoute(location.pathname)
  }, [location.pathname, setCurrentRoute])

  // Handle auth-based navigation
  const navigateWithAuth = (to: string, options?: { replace?: boolean }) => {
    if (!isAuthenticated && to !== ROUTES.LOGIN && to !== ROUTES.REGISTER) {
      setReturnUrl(to)
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    navigate(to, options)
  }

  // Handle drawer state
  const closeDrawer = () => toggleDrawer(false)
  const openDrawer = () => toggleDrawer(true)

  // Handle return URL navigation
  const navigateToReturnUrl = () => {
    if (returnUrl) {
      navigate(returnUrl)
      setReturnUrl(null)
    } else {
      navigate(ROUTES.HOME)
    }
  }

  return {
    // State
    currentRoute,
    previousRoute,
    returnUrl,
    isDrawerOpen,
    
    // Actions
    navigateWithAuth,
    closeDrawer,
    openDrawer,
    toggleDrawer,
    navigateToReturnUrl,
    clearNavigation
  }
} 