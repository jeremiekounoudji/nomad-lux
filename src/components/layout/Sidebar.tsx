import React from 'react'
import { Home, Search, Heart, Plus, Calendar, User, Settings, LogOut, Bookmark, HelpCircle, Shield, Bell, ClipboardList, LogIn, UserPlus } from 'lucide-react'
import { mockCurrentUser } from '../../lib/mockData'
import { SidebarProps } from '../../interfaces'

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const navigationItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'liked', label: 'Liked', icon: Heart },
    { key: 'create', label: 'Create Property', icon: Plus },
    { key: 'listings', label: 'My Listings', icon: Home },
    { key: 'bookings', label: 'My Bookings', icon: Calendar },
    { key: 'requests', label: 'Booking Requests', icon: ClipboardList },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'Profile', icon: User },
  ]

  const secondaryItems = [
    { key: 'saved', label: 'Saved', icon: Bookmark },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'help', label: 'Help', icon: HelpCircle },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'login', label: 'Login', icon: LogIn },
    { key: 'register', label: 'Register', icon: UserPlus },
  ]

  return (
    <div className="hidden lg:flex lg:w-64 xl:w-72 bg-white border-r border-gray-200 flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">NL</span>
          </div>
          <span className="font-script font-bold text-2xl text-primary-600">
            Nomad Lux
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={mockCurrentUser.avatar_url}
            alt={mockCurrentUser.display_name}
            className="w-16 h-16 rounded-full ring-2 ring-secondary-200"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{mockCurrentUser.display_name}</h3>
            <p className="text-sm text-gray-500">@{mockCurrentUser.username}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div>
                <span className="font-semibold text-gray-900">472</span>
                <span className="text-gray-500 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">12.4K</span>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                currentPage === item.key
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-6 h-6 ${
                currentPage === item.key ? 'text-primary-600' : 'text-gray-500'
              }`} />
              <span className="text-base">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <nav className="space-y-1 px-3">
            {secondaryItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5 text-gray-500" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar 