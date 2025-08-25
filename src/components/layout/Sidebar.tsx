import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Heart, Plus, Calendar, User, LogOut, HelpCircle, Shield, Bell, ClipboardList, LogIn, UserPlus, Wallet } from 'lucide-react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import { useNavigation } from '../../hooks/useNavigation'
import { ROUTES } from '../../router/types'
import toast from 'react-hot-toast'
import { useTranslation } from '../../lib/stores/translationStore'

const Sidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { signOut } = useAuth()
  const { navigateWithAuth } = useNavigation()
  const { t } = useTranslation(['navigation', 'auth', 'common'])

  const handleLogout = async () => {
    try {
      console.log('🚪 User logout initiated from sidebar')
      await signOut()
      toast.success(t('navigation.messages.logoutSuccess'))
      navigateWithAuth(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      toast.error(t('navigation.messages.logoutError'))
    }
  }

  const navigationItems = [
    { path: ROUTES.HOME, label: t('navigation.menu.home'), icon: Home },
    { path: ROUTES.SEARCH, label: t('navigation.menu.search'), icon: Search },
    { path: ROUTES.LIKED_PROPERTIES, label: t('navigation.menu.favorites'), icon: Heart, requireAuth: true },
    { path: ROUTES.CREATE_PROPERTY, label: t('navigation.menu.createProperty'), icon: Plus, requireAuth: true },
    { path: ROUTES.MY_LISTINGS, label: t('navigation.menu.myListings'), icon: Home, requireAuth: true },
    { path: ROUTES.MY_BOOKINGS, label: t('navigation.menu.bookings'), icon: Calendar, requireAuth: true },
    { path: ROUTES.BOOKING_REQUESTS, label: t('navigation.menu.bookingRequests'), icon: ClipboardList, requireAuth: true },
    { path: ROUTES.NOTIFICATIONS, label: t('navigation.menu.notifications'), icon: Bell, requireAuth: true },
    { path: ROUTES.WALLET, label: t('navigation.menu.wallet'), icon: Wallet, requireAuth: true },
    { path: '/profile', label: t('navigation.menu.profile'), icon: User, requireAuth: true },
  ]

  const secondaryItems = [
    { path: ROUTES.HELP, label: t('navigation.menu.helpCenter'), icon: HelpCircle },
    { path: ROUTES.TERMS, label: t('navigation.menu.terms'), icon: Shield },
    ...(isAuthenticated ? [] : [
      { path: ROUTES.LOGIN, label: t('navigation.menu.login'), icon: LogIn },
      { path: ROUTES.REGISTER, label: t('navigation.menu.signup'), icon: UserPlus },
    ])
  ]

  return (
    <div className="hidden lg:flex lg:w-64 xl:w-72 bg-white border-r border-gray-200 flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <NavLink to={ROUTES.HOME} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">NL</span>
          </div>
          <span className="font-script font-bold text-2xl text-primary-600">
            {t('navigation.brand.name')}
          </span>
        </NavLink>
      </div>

      {/* Profile Section - Now a nice card with shadow */}
      <div className="p-4 flex-shrink-0">
        {isAuthenticated && user ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with verification badge */}
              <div className="relative mb-4">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                  alt={user.display_name}
                  className="w-16 h-16 rounded-full ring-4 ring-primary-100 shadow-md cursor-pointer hover:ring-primary-200 transition-all"
                />
                {user.is_email_verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              
              {/* User info */}
              <div className="w-full">
                <h3 className="font-bold text-base text-gray-900 mb-1 truncate">{user.display_name}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate">@{user.username || user.email.split('@')[0]}</p>
                
                {/* Role badge */}
                <div className="mb-3">
                  <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {user.user_role === 'both' ? t('navigation.profile.hostAndGuest') : t(`navigation.profile.${user.user_role}`)}
                  </span>
                </div>
                
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-gray-900">{user.total_properties || 0}</div>
                    <div className="text-xs text-gray-500">{t('navigation.profile.properties')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-gray-900">{user.total_bookings || 0}</div>
                    <div className="text-xs text-gray-500">{t('navigation.profile.bookings')}</div>
                  </div>
                </div>
                
                {/* Ratings */}
                <div className="flex justify-center gap-3 text-xs">
                  {user.guest_rating && user.guest_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-medium">{user.guest_rating.toFixed(1)}</span>
                      <span className="text-gray-500">{t('navigation.profile.guest')}</span>
                    </div>
                  )}
                  {user.is_host && user.host_rating && user.host_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span>🏠</span>
                      <span className="font-medium">{user.host_rating.toFixed(1)}</span>
                      <span className="text-gray-500">{t('navigation.profile.host')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full ring-4 ring-gray-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div className="w-full">
                <h3 className="font-bold text-base text-gray-900 mb-1">{t('navigation.profile.guestUser')}</h3>
                <p className="text-xs text-gray-500 mb-4">{t('navigation.profile.signInToAccess')}</p>
                <div className="flex flex-col gap-2">
                  <NavLink
                    to={ROUTES.LOGIN}
                    className="w-full bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center text-sm"
                  >
                    {t('auth.login.signIn')}
                  </NavLink>
                  <NavLink
                    to={ROUTES.REGISTER}
                    className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center text-sm"
                  >
                    {t('navigation.menu.signup')}
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <div className="py-4">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => (
              (!item.requireAuth || isAuthenticated) && (
                <NavLink
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-6 h-6 ${
                        isActive ? 'text-primary-600' : 'text-gray-500'
                      }`} />
                      <span className="text-base">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div className="mt-8 pt-4 border-t border-gray-100">
            <nav className="space-y-1 px-3">
              {secondaryItems.map((item) => (
                <NavLink
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${
                        isActive ? 'text-primary-600' : 'text-gray-500'
                      }`} />
                      <span className="text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Logout - Fixed at bottom */}
      {isAuthenticated && (
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{t('auth.actions.logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar 