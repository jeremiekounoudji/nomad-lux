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
    <div className="hidden h-screen flex-col border-r border-gray-200 bg-white lg:flex lg:w-64 xl:w-72">
      {/* Logo */}
      <div className="shrink-0 border-b border-gray-100 p-6">
        <NavLink to={ROUTES.HOME} className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500">
            <span className="text-lg font-bold text-white">{t('navigation.brand.logo')}</span>
          </div>
          <span className="font-script text-2xl font-bold text-primary-600">
            {t('navigation.brand.name')}
          </span>
        </NavLink>
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile Section - Now in the scrollable area */}
        <div className="shrink-0 p-4">
          {isAuthenticated && user ? (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                    alt={user.display_name}
                    className="size-12 cursor-pointer rounded-full shadow-sm ring-2 ring-primary-100 transition-all hover:ring-primary-200"
                  />
                </div>
                
                {/* User info */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="truncate text-sm font-bold text-gray-900">{user.display_name}</h3>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              {/* View Profile Button */}
              <NavLink 
                to="/profile" 
                className="mt-3 w-full rounded-lg bg-primary-500 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-primary-600"
              >
                {t('navigation.profile.viewProfile')}
              </NavLink>
              
              {/* Stats row - Removed as per request */}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-100">
                  <User className="size-6 text-gray-500" />
                </div>
                
                {/* Guest info */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-bold text-gray-900">{t('navigation.profile.guestUser')}</h3>
                  <p className="text-xs text-gray-500">{t('navigation.profile.signInToAccess')}</p>
                </div>
              </div>
              
              {/* Auth buttons */}
              <div className="mt-3 flex gap-2">
                <NavLink
                  to={ROUTES.LOGIN}
                  className="flex-1 rounded-lg bg-primary-500 px-2 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-primary-600"
                >
                  {t('auth.login.signIn')}
                </NavLink>
                <NavLink
                  to={ROUTES.REGISTER}
                  className="flex-1 rounded-lg bg-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                  {t('navigation.menu.signup')}
                </NavLink>
              </div>
            </div>
          )}
        </div>

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
                      <item.icon className={`size-6 ${
                        isActive ? 'text-primary-500' : 'text-gray-500'
                      }`} />
                      <span className="text-base">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div className="mt-8 border-t border-gray-100 pt-4">
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
                      <item.icon className={`size-5 ${
                        isActive ? 'text-primary-500' : 'text-gray-500'
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
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-5 text-gray-500" />
            <span className="text-sm">{t('auth.actions.logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar