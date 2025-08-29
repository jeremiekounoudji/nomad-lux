import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../lib/stores/authStore'
import { Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { useNavigation } from '../../hooks/useNavigation'
import { useTranslation } from '../../lib/stores/translationStore'
import { useDrawerItems } from '../../hooks/useDrawerItems'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileDrawer from './MobileDrawer'
import DesktopTopBar from './DesktopTopBar'
import MobileBottomNavigation from './MobileBottomNavigation'
import FloatingNotificationButton from './FloatingNotificationButton'
import toast from 'react-hot-toast'

const MainLayout: React.FC = () => {
  const location = useLocation()
  const { signOut } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const { t } = useTranslation(['navigation', 'common'])
  const { 
    isDrawerOpen,
    closeDrawer,
    toggleDrawer,
    navigateWithAuth
  } = useNavigation()
  
  const { drawerItems } = useDrawerItems(isAuthenticated)

  const handleLogout = async () => {
    try {
      console.log('🚪 User logout initiated')
      await signOut()
      toast.success(t('navigation:messages.logoutSuccess'))
      closeDrawer()
      navigateWithAuth(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      toast.error(t('navigation:messages.logoutError'))
    }
  }

  // Check if we should show bottom navigation (hide on auth pages only)
  const shouldShowBottomNav = !location.pathname.includes('/login') && 
                             !location.pathname.includes('/register') && 
                             !location.pathname.includes('/admin/login') && 
                             !location.pathname.includes('/admin/register')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <MobileHeader onToggleDrawer={toggleDrawer} />

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          isAuthenticated={isAuthenticated}
          user={user}
          drawerItems={drawerItems}
          onLogout={handleLogout}
        />

        {/* Desktop Top Bar */}
        <DesktopTopBar
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onSearch={() => navigateWithAuth(ROUTES.SEARCH)}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${shouldShowBottomNav ? 'pb-20 lg:pb-0' : ''} p-2 sm:p-4 lg:p-6`}>
          <Outlet />
        </main>

        {/* Floating Notification Button - Mobile Only */}
        {shouldShowBottomNav && (
          <FloatingNotificationButton isAuthenticated={isAuthenticated} />
        )}

        {/* Mobile Bottom Navigation */}
        {shouldShowBottomNav && (
          <MobileBottomNavigation isAuthenticated={isAuthenticated} />
        )}
      </div>
    </div>
  )
}

export default MainLayout 