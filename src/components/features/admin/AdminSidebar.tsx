import React from 'react'
import { Crown, Home, Users, Building2, Calendar, BarChart3, Settings, LogOut, X, Clock, DollarSign } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface AdminSidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
  onLogout?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentSection, 
  onSectionChange,
  isOpen,
  onToggle,
  onLogout
}) => {
  const { t } = useTranslation(['admin', 'auth'])
  const menuItems = [
    { key: 'dashboard', label: t('admin.navigation.dashboard'), icon: Home },
    { key: 'users', label: t('admin.navigation.users'), icon: Users },
    { key: 'properties', label: t('admin.navigation.properties'), icon: Building2 },
    { key: 'bookings', label: t('admin.navigation.bookings'), icon: Calendar },
    { key: 'refunds', label: t('admin.navigation.refunds'), icon: DollarSign },
    { key: 'activities', label: t('admin.activity.title'), icon: Clock },
    { key: 'analytics', label: t('admin.analytics.title'), icon: BarChart3 },
    { key: 'settings', label: t('admin.navigation.settings'), icon: Settings },
  ]

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  const handleItemClick = (key: string) => {
    onSectionChange(key)
    if (window.innerWidth < 1024) {
      onToggle() // Close mobile sidebar
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:z-auto lg:translate-x-0${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
              <Crown className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-script text-xl font-bold text-primary-600">Nomad Lux</h1>
              <p className="text-xs text-gray-500">{t('admin.banner.title')}</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                currentSection === item.key
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`size-5 ${
                currentSection === item.key ? 'text-primary-600' : 'text-gray-500'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-5" />
            <span>{t('auth.actions.logout')}</span>
          </button>
        </div>
      </div>
    </>
  )
} 