import React from 'react'
import { Home, Heart, Plus, Calendar, User, Menu, Search, Bell, ClipboardList, X, LogOut, HelpCircle, Shield, LogIn, UserPlus, Crown, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../lib/stores/authStore'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { useNavigation } from '../../hooks/useNavigation'
import { NotificationCenter } from '../shared/NotificationCenter'
import { CompactLanguageSelector } from '../shared/LanguageSelector'
import { useTranslation } from '../../lib/stores/translationStore'
import Sidebar from './Sidebar'
import toast from 'react-hot-toast'

const MainLayout: React.FC = () => {
  const location = useLocation()
  const { signOut } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const { t } = useTranslation('navigation')
  const { 
    isDrawerOpen,
    closeDrawer,
    openDrawer,
    toggleDrawer,
    navigateWithAuth
  } = useNavigation()
  
  const drawerItems = [
    { path: ROUTES.SEARCH, label: t('menu.search'), icon: Search },
    { path: ROUTES.MY_LISTINGS, label: t('menu.properties'), icon: Home, requireAuth: true },
    { path: ROUTES.BOOKING_REQUESTS, label: t('menu.bookings'), icon: ClipboardList, requireAuth: true },
    { path: ROUTES.NOTIFICATIONS, label: t('menu.notifications'), icon: Bell, requireAuth: true },
    { path: ROUTES.WALLET, label: t('menu.wallet'), icon: Wallet, requireAuth: true },
    { path: ROUTES.HELP, label: t('menu.help'), icon: HelpCircle },
    { path: ROUTES.TERMS, label: t('footer.terms'), icon: Shield },
    ...(isAuthenticated ? [] : [
      { path: ROUTES.LOGIN, label: t('menu.login'), icon: LogIn },
      { path: ROUTES.REGISTER, label: t('menu.signup'), icon: UserPlus },
    ]),
    { path: ROUTES.ADMIN_LOGIN, label: t('menu.admin'), icon: Crown }
  ]

  const handleLogout = async () => {
    try {
      console.log('🚪 User logout initiated')
      await signOut()
      toast.success(t('messages.logoutSuccess'))
      closeDrawer()
      navigateWithAuth(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      toast.error(t('messages.logoutError'))
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {/* Left: Menu/Drawer */}
            <button 
              onClick={() => toggleDrawer()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Center: Nomad Lux Name */}
            <NavLink to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NL</span>
              </div>
              <span className="font-script font-bold text-xl text-primary-600">
                {t('brand.name')}
              </span>
            </NavLink>
            
            {/* Right: Search, Language, and Notification */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <NavLink 
                to={ROUTES.SEARCH}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </NavLink>
              <CompactLanguageSelector className="flex-shrink-0" />
              {isAuthenticated && (
                <NotificationCenter className="p-2 hover:bg-gray-100 rounded-lg transition-colors" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeDrawer}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <NavLink to={ROUTES.HOME} className="flex items-center gap-3 min-w-0 flex-1" onClick={closeDrawer}>
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">NL</span>
                </div>
                <span className="font-script font-bold text-2xl text-primary-600 truncate">
                  {t('brand.name')}
                </span>
              </NavLink>
              <button 
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Profile Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                  alt={user.display_name}
                  className="w-12 h-12 rounded-full ring-2 ring-secondary-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.display_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="truncate">@{user.username || user.email.split('@')[0]}</span>
                    {user.is_email_verified && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{user.user_role === 'both' ? t('profile.hostAndGuest', 'Host & Guest') : t(`profile.${user.user_role}`, user.user_role)}</span>
                    <span>⭐ {(user.guest_rating ?? 0).toFixed(1)}</span>
                    {user.is_host && (
                      <span>🏠 {user.total_properties}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full ring-2 ring-secondary-200 flex-shrink-0 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{t('profile.guestUser')}</h3>
                  <p className="text-sm text-gray-500 truncate">{t('profile.notSignedIn')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {drawerItems.map((item) => (
                (!item.requireAuth || isAuthenticated) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeDrawer}
                    className={({ isActive }) => `
                      w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 min-w-0
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'
                    }`} />
                    <span className="text-base truncate">{item.label}</span>
                  </NavLink>
                )
              ))}
            </nav>

            {/* Language Selector */}
            <div className="mt-6 pt-4 border-t border-gray-100 px-3">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</p>
                <CompactLanguageSelector />
              </div>
            </div>

            {/* Logout */}
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-100 px-3">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 min-w-0"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base truncate">{t('menu.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigateWithAuth(ROUTES.SEARCH)
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            {/* Language Selector */}
            <CompactLanguageSelector />
            {/* Admin Panel - always visible */}
            <NavLink 
              to={ROUTES.ADMIN_LOGIN}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Crown className="w-5 h-5" />
            </NavLink>
            {/* Create Post - authenticated only */}
            {isAuthenticated && (
              <NavLink 
                to={ROUTES.CREATE_PROPERTY}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </NavLink>
            )}
            {/* Notification Center - authenticated only */}
            {isAuthenticated && (
              <NotificationCenter className="p-2 hover:bg-gray-100 rounded-lg transition-colors" />
            )}
            {/* Sign Out - authenticated only */}
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title={t('actions.signOut')}
              >
                <LogOut className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout 