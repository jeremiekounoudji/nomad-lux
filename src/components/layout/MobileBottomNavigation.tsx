import React from 'react'
import { Home, ClipboardList, Plus, Calendar, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../router/types'
interface MobileBottomNavigationProps {
  isAuthenticated: boolean
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  isAuthenticated
}) => {

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex items-center justify-around px-1 py-3">
        <NavLink
          to={ROUTES.HOME}
          className={({ isActive }) => `
            flex items-center justify-center h-12 w-12 rounded-lg transition-colors
            ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
        >
          <Home className="size-6" />
        </NavLink>

        <NavLink
          to={ROUTES.MY_LISTINGS}
          className={({ isActive }) => `
            flex items-center justify-center h-12 w-12 rounded-lg transition-colors
            ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
        >
          <ClipboardList className="size-6" />
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.CREATE_PROPERTY : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex items-center justify-center h-12 w-12 rounded-lg transition-colors
            ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
        >
          <Plus className="size-6" />
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.MY_BOOKINGS : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex items-center justify-center h-12 w-12 rounded-lg transition-colors
            ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
        >
          <Calendar className="size-6" />
        </NavLink>

        <NavLink
          to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
          className={({ isActive }) => `
            flex items-center justify-center h-12 w-12 rounded-lg transition-colors
            ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
          `}
        >
          <User className="size-6" />
        </NavLink>
      </div>
    </div>
  )
}

export default MobileBottomNavigation
