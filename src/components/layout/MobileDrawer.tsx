import React from 'react'
import { X, User, LogOut } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { CompactLanguageSelector } from '../shared/LanguageSelector'
import { useTranslation } from '../../lib/stores/translationStore'
import { User as UserType } from '../../interfaces/User'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  user: UserType | null
  drawerItems: Array<{
    path: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    requireAuth?: boolean
  }>
  onLogout: () => void
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  drawerItems,
  onLogout
}) => {
  const { t } = useTranslation(['navigation', 'common', 'profile'])
  const location = useLocation()

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="shrink-0 border-b border-gray-100 p-6">
          <div className="mb-6 flex items-center justify-between">
            <NavLink to={ROUTES.HOME} className="flex min-w-0 flex-1 items-center gap-3" onClick={onClose}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-500">
                <span className="text-lg font-bold text-white">NL</span>
              </div>
              <span className="truncate font-script text-2xl font-bold text-primary-600">
                {t('navigation.brand.name')}
              </span>
            </NavLink>
            <button 
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>
          
          {/* Profile Section */}
          {isAuthenticated && user ? (
            <div className="flex min-w-0 items-start gap-3">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                alt={user.display_name}
                className="size-12 shrink-0 rounded-full ring-2 ring-secondary-200"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="truncate text-left text-sm font-semibold text-gray-900 sm:text-base">{user.display_name}</h3>
                  <p className="truncate text-xs text-gray-500 sm:text-sm">@{user.username || user.email.split('@')[0]}</p>
                  {user.is_email_verified && (
                    <span className="text-xs text-green-500">✓</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="capitalize">{user.user_role === 'both' ? t('profile.hostAndGuest', 'Host & Guest') : t(`profile.${user.user_role}`, user.user_role)}</span>
                  <span>⭐ {(user.guest_rating ?? 0).toFixed(1)}</span>
                  {user.is_host && (
                    <span>🏠 {user.total_properties}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 ring-2 ring-secondary-200">
                <User className="size-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="truncate font-semibold text-gray-900">{t('profile.guestUser')}</h3>
                <p className="truncate text-sm text-gray-500">{t('profile.notSignedIn')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {drawerItems.map((item) => (
              (!item.requireAuth || isAuthenticated) && (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 min-w-0
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className={`size-5 shrink-0 ${
                    location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <span className="truncate text-base">{item.label}</span>
                </NavLink>
              )
            ))}
          </nav>

          {/* Language Selector */}
          <div className="mt-6 border-t border-gray-100 px-3 pt-4">
            <div className="px-4 py-2">
              <p className="mb-2 text-sm font-medium text-gray-700">{t('navigation.settings.language')}</p>
              <CompactLanguageSelector />
            </div>
          </div>

          {/* Logout */}
          {isAuthenticated && (
            <div className="mt-4 border-t border-gray-100 px-3 pt-4">
              <button 
                onClick={onLogout}
                className="flex w-full min-w-0 items-center gap-4 rounded-xl px-4 py-3 text-left text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-5 shrink-0" />
                <span className="truncate text-base">{t('navigation.menu.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileDrawer
