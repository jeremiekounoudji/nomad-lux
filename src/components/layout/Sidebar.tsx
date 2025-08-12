import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Heart, Plus, Calendar, User, LogOut, HelpCircle, Shield, Bell, ClipboardList, LogIn, UserPlus, Wallet } from 'lucide-react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import { useNavigation } from '../../hooks/useNavigation'
import { ROUTES } from '../../router/types'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const Sidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { signOut } = useAuth()
  const { navigateWithAuth } = useNavigation()
  const { t } = useTranslation(['navigation', 'auth', 'common'])

  const handleLogout = async () => {
    try {
      console.log('🚪 User logout initiated from sidebar')
      await signOut()
      toast.success(t('navigation.messages.logoutSuccess', { defaultValue: 'Logged out successfully' }))
      navigateWithAuth(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      toast.error(t('navigation.messages.logoutError', { defaultValue: 'Failed to logout' }))
    }
  }

  const navigationItems = [
    { path: ROUTES.HOME, label: t('navigation.menu.home', { defaultValue: 'Home' }), icon: Home },
    { path: ROUTES.SEARCH, label: t('navigation.menu.search', { defaultValue: 'Search' }), icon: Search },
    { path: ROUTES.LIKED_PROPERTIES, label: t('navigation.menu.favorites', { defaultValue: 'Favorites' }), icon: Heart, requireAuth: true },
    { path: ROUTES.CREATE_PROPERTY, label: t('navigation.menu.createProperty', { defaultValue: 'Create Property' }), icon: Plus, requireAuth: true },
    { path: ROUTES.MY_LISTINGS, label: t('navigation.menu.myListings', { defaultValue: 'My Listings' }), icon: Home, requireAuth: true },
    { path: ROUTES.MY_BOOKINGS, label: t('navigation.menu.bookings', { defaultValue: 'My Bookings' }), icon: Calendar, requireAuth: true },
    { path: ROUTES.BOOKING_REQUESTS, label: t('navigation.menu.bookingRequests', { defaultValue: 'Booking Requests' }), icon: ClipboardList, requireAuth: true },
    { path: ROUTES.NOTIFICATIONS, label: t('navigation.menu.notifications', { defaultValue: 'Notifications' }), icon: Bell, requireAuth: true },
    { path: ROUTES.WALLET, label: t('navigation.menu.wallet', { defaultValue: 'Wallet' }), icon: Wallet, requireAuth: true },
    { path: ROUTES.HOME, label: t('navigation.menu.profile', { defaultValue: 'Profile' }), icon: User, requireAuth: true },
  ]

  const secondaryItems = [
    { path: ROUTES.HELP, label: t('navigation.menu.helpCenter', { defaultValue: 'Help Center' }), icon: HelpCircle },
    { path: ROUTES.TERMS, label: t('navigation.menu.terms', { defaultValue: 'Terms & Conditions' }), icon: Shield },
    ...(isAuthenticated ? [] : [
      { path: ROUTES.LOGIN, label: t('navigation.menu.login', { defaultValue: 'Login' }), icon: LogIn },
      { path: ROUTES.REGISTER, label: t('navigation.menu.signup', { defaultValue: 'Sign Up' }), icon: UserPlus },
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
            Nomad Lux
          </span>
        </NavLink>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        {isAuthenticated && user ? (
          <div className="flex flex-col items-center text-center">
            {/* Avatar at top */}
            <div className="relative mb-4">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                alt={user.display_name}
                className="w-20 h-20 rounded-full ring-4 ring-primary-100 shadow-lg cursor-pointer hover:ring-primary-200 transition-all"
                onClick={() => navigateWithAuth(ROUTES.HOME)}
              />
              {user.is_email_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            
            {/* User info column */}
            <div className="w-full">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{user.display_name}</h3>
              <p className="text-sm text-gray-500 mb-3">@{user.username || user.email.split('@')[0]}</p>
              
              {/* Role badge */}
              <div className="mb-4">
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {user.user_role === 'both' ? 'Host & Guest' : user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1)}
                </span>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{user.total_properties}</div>
                  <div className="text-xs text-gray-500">{t('navigation.profile.properties', { defaultValue: 'Properties' })}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{user.total_bookings}</div>
                  <div className="text-xs text-gray-500">{t('navigation.profile.bookings', { defaultValue: 'Bookings' })}</div>
                </div>
              </div>
              
              {/* Ratings */}
              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-medium">{user.guest_rating.toFixed(1)}</span>
                  <span className="text-gray-500">{t('navigation.profile.guest', { defaultValue: 'Guest' })}</span>
                </div>
                {user.is_host && user.host_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <span>🏠</span>
                    <span className="font-medium">{user.host_rating.toFixed(1)}</span>
                    <span className="text-gray-500">{t('navigation.profile.host', { defaultValue: 'Host' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full ring-4 ring-gray-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <div className="w-full">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{t('navigation.profile.guestUser', { defaultValue: 'Guest User' })}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('navigation.profile.signInToAccess', { defaultValue: 'Please sign in to access all features' })}</p>
              <div className="flex flex-col gap-2">
                <NavLink
                  to={ROUTES.LOGIN}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                >
                  {t('auth.login.signIn', { defaultValue: 'Sign In' })}
                </NavLink>
                <NavLink
                  to={ROUTES.REGISTER}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
                >
                  {t('navigation.menu.signup', { defaultValue: 'Sign Up' })}
                </NavLink>
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
            <span className="text-sm">{t('auth.actions.logout', { defaultValue: 'Logout' })}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar 