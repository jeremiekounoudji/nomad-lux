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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
      {/* Left Section - Mobile Menu & Brand */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand (visible only on mobile) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-script font-bold text-lg text-primary-600">Nomad Lux</h1>
          </div>
        </div>
      </div>

      {/* Center Section - Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('admin.search.placeholder', { defaultValue: 'Search users, properties, bookings...' })}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Search Icon (Mobile) */}
        <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button 
          onClick={handleNotificationClick}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative transition-colors"
          title={t('admin.actions.viewActivities', { defaultValue: 'View all activities' })}
        >
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative group">
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button 
                onClick={() => onSectionChange?.('settings')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('admin.navigation.settings')}
              </button>
              <hr className="my-1" />
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.actions.logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.display_name || user?.email?.split('@')[0] || t('admin.users.adminUser', { defaultValue: 'Admin User' })}
            </p>
            <p className="text-xs text-gray-500">{roleDisplay}</p>
          </div>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{userInitials}</span>
          </div>
        </div>
      </div>
    </header>
  )
} 