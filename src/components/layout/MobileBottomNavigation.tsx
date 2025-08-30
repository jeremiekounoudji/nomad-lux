import React from 'react'
import { Home, ClipboardList, Plus, Calendar, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { useTranslation } from '../../lib/stores/translationStore'

interface MobileBottomNavigationProps {
  isAuthenticated: boolean
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  isAuthenticated
}) => {
  const { t } = useTranslation(['navigation', 'common'])

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        <NavLink
          to={ROUTES.HOME}
          className={({ isActive }) => `
            flex flex-col items-center h-auto py-2 px-3 transition-colors
            ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <Home className="size-6" />
          <span className="mt-1 text-xs">{t('navigation.menu.home')}</span>
        </NavLink>

        <NavLink
          to={ROUTES.MY_LISTINGS}
          className={({ isActive }) => `
            flex flex-col items-center h-auto py-2 px-3 transition-colors
            ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <ClipboardList className="size-6" />
          <span className="mt-1 text-xs">{t('navigation.menu.myListings')}</span>
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.CREATE_PROPERTY : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex flex-col items-center h-auto py-2 px-3 transition-colors
            ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <Plus className="size-6" />
          <span className="mt-1 text-xs">{isAuthenticated ? t('navigation.menu.createProperty') : t('navigation.menu.signup')}</span>
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.MY_BOOKINGS : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex flex-col items-center h-auto py-2 px-3 transition-colors
            ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <Calendar className="size-6" />
          <span className="mt-1 text-xs">{isAuthenticated ? t('navigation.menu.bookings') : t('navigation.menu.login')}</span>
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex flex-col items-center h-auto py-2 px-3 transition-colors
            ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <User className="size-6" />
          <span className="mt-1 text-xs">{isAuthenticated ? t('navigation.menu.profile') : t('navigation.menu.login')}</span>
        </NavLink>
      </div>
    </div>
  )
}

export default MobileBottomNavigation
