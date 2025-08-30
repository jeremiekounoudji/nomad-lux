import React from 'react'
import { Search, Bell, Settings, LogOut, Menu, Crown } from 'lucide-react'
import { useAuthStore } from '../../../lib/stores/authStore'
import { useTranslation } from '../../../lib/stores/translationStore'

interface AdminHeaderProps {
  onToggleSidebar: () => void
  onLogout?: () => void
  onSectionChange?: (section: string) => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onToggleSidebar, 
  onLogout, 
  onSectionChange 
}) => {
  const { user } = useAuthStore()
  const { t } = useTranslation(['admin', 'auth', 'common'])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  const handleNotificationClick = () => {
    if (onSectionChange) {
      onSectionChange('activities')
    }
  }

  // Get user initials for avatar
  const getUserInitials = (displayName?: string, email?: string) => {
    if (displayName) {
      return displayName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'AD'
  }

  // Get role display name
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return t('admin.roles.super_admin', { defaultValue: 'Super Administrator' })
      case 'admin':
        return t('admin.roles.admin', { defaultValue: 'Administrator' })
      case 'host':
        return t('admin.roles.host', { defaultValue: 'Host' })
      case 'guest':
        return t('admin.roles.guest', { defaultValue: 'Guest' })
      default:
        return t('admin.roles.user', { defaultValue: 'User' })
    }
  }

  const userInitials = getUserInitials(user?.display_name, user?.email)
  const roleDisplay = getRoleDisplayName(user?.user_role)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left Section - Mobile Menu & Brand */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Mobile Brand (visible only on mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
            <Crown className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-script text-lg font-bold text-primary-600">Nomad Lux</h1>
          </div>
        </div>
      </div>

      {/* Center Section - Search (Desktop) */}
      <div className="mx-8 hidden max-w-2xl flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.search.placeholder', { defaultValue: 'Search users, properties, bookings...' })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Search Icon (Mobile) */}
        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden">
          <Search className="size-5" />
        </button>

        {/* Notifications */}
        <button 
          onClick={handleNotificationClick}
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title={t('admin.actions.viewActivities', { defaultValue: 'View all activities' })}
        >
          <Bell className="size-5" />
          <div className="absolute -right-1 -top-1 size-3 rounded-full bg-red-500"></div>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="group relative">
          <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Settings className="size-5" />
          </button>
          
          {/* Dropdown Menu */}
          <div className="invisible absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
            <div className="py-2">
              <button 
                onClick={() => onSectionChange?.('settings')}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="size-4" />
                {t('admin.navigation.settings')}
              </button>
              <hr className="my-1" />
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                {t('auth.actions.logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.display_name || user?.email?.split('@')[0] || t('admin.users.adminUser', { defaultValue: 'Admin User' })}
            </p>
            <p className="text-xs text-gray-500">{roleDisplay}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-500">
            <span className="text-sm font-semibold text-white">{userInitials}</span>
          </div>
        </div>
      </div>
    </header>
  )
} 