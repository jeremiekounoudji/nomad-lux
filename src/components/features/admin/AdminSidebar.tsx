import React from 'react'
import { Crown, Home, Users, Building2, Calendar, BarChart3, Settings, LogOut, X, Clock } from 'lucide-react'

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
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'properties', label: 'Property Approval', icon: Building2 },
    { key: 'bookings', label: 'Booking Management', icon: Calendar },
    { key: 'activities', label: 'Activity Log', icon: Clock },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'System Settings', icon: Settings },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-script font-bold text-xl text-primary-600">Nomad Lux</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                currentSection === item.key
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                currentSection === item.key ? 'text-primary-600' : 'text-gray-500'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
} 