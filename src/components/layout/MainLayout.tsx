import React, { useState, useEffect } from 'react'
import { Home, Heart, Plus, Calendar, User, Settings, Menu, Search, Bell, ClipboardList, X, LogOut, Bookmark, HelpCircle, Shield, LogIn, UserPlus, Crown } from 'lucide-react'
import { mockCurrentUser } from '../../lib/mockData'
import Sidebar from './Sidebar'

import { MainLayoutProps } from '../../interfaces'

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage = 'home', 
  onPageChange 
}) => {
  const [activePage, setActivePage] = useState(currentPage)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Sync activePage with currentPage prop
  useEffect(() => {
    setActivePage(currentPage)
  }, [currentPage])
  
  const navigationItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'liked', label: 'Liked', icon: Heart },
    { key: 'create', label: 'Create', icon: Plus },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User }
  ]

  const drawerItems = [
    { key: 'search', label: 'Search', icon: Search },
    { key: 'listings', label: 'My Listings', icon: Home },
    { key: 'requests', label: 'Booking Requests', icon: ClipboardList },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'saved', label: 'Saved', icon: Bookmark },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'help', label: 'Help', icon: HelpCircle },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'login', label: 'Login', icon: LogIn },
    { key: 'register', label: 'Register', icon: UserPlus },
    { key: 'admin-login', label: 'Admin Access', icon: Crown },
  ]

  const handlePageChange = (page: string) => {
    setActivePage(page)
    setIsDrawerOpen(false) // Close drawer when navigating
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const handleCreatePostClick = () => {
    handlePageChange('create')
  }

  const handleNotificationClick = () => {
    handlePageChange('notifications')
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar currentPage={activePage} onPageChange={handlePageChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {/* Left: Menu/Drawer */}
            <button 
              onClick={toggleDrawer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Center: Nomad Lux Name */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NL</span>
              </div>
              <span className="font-script font-bold text-xl text-primary-600">
                Nomad Lux
              </span>
            </div>
            
            {/* Right: Search and Notification */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => handlePageChange('search')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNotificationClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">NL</span>
                </div>
                <span className="font-script font-bold text-2xl text-primary-600 truncate">
                  Nomad Lux
                </span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={mockCurrentUser.avatar_url}
                alt={mockCurrentUser.display_name}
                className="w-12 h-12 rounded-full ring-2 ring-secondary-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{mockCurrentUser.display_name}</h3>
                <p className="text-sm text-gray-500 truncate">@{mockCurrentUser.username}</p>
              </div>
            </div>
          </div>

          {/* Drawer Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {drawerItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handlePageChange(item.key)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 min-w-0 ${
                    activePage === item.key
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${
                    activePage === item.key ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <span className="text-base truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-8 pt-4 border-t border-gray-100 px-3">
              <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 min-w-0">
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-base truncate">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search destinations, properties, or hosts..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button 
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></div>
            </button>
            
            {/* Admin Access Button */}
            <button 
              onClick={() => handlePageChange('admin-login')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Admin Access"
            >
              <Crown className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
            </button>
            
            <button 
              onClick={handleCreatePostClick}
              className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors duration-200 shadow-sm"
            >
              Create Post
            </button>
            <button 
              onClick={() => handlePageChange('login')}
              className="bg-secondary-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-secondary-700 transition-colors duration-200 shadow-sm"
            >
              Login
            </button>
            <img
              src={mockCurrentUser.avatar_url}
              alt={mockCurrentUser.display_name}
              className="w-10 h-10 rounded-full cursor-pointer ring-2 ring-secondary-200"
              onClick={() => handlePageChange('profile')}
            />
          </div>
        </div>

        {/* Main Content with Responsive Grid */}
        <main className="flex-1 p-2 sm:p-4 lg:p-6 pb-20 lg:pb-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {/* Content wrapper with responsive grid */}
            <div className={`grid gap-2 sm:gap-4 lg:gap-6 w-full ${
              activePage === 'create' 
                ? 'grid-cols-1' // Full width for create property form on all screens
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Normal grid for other pages
            }`}>
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
          <div className="flex justify-between items-center py-2 px-4 relative max-w-full">
            {/* Left side navigation items */}
            <div className="flex justify-around flex-1">
              {navigationItems.slice(0, 2).map((item) => (
                <button
                  key={item.key}
                  onClick={() => handlePageChange(item.key)}
                  className={`flex flex-col items-center py-2 px-2 transition-colors min-w-0 ${
                    activePage === item.key ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs mt-1 truncate">{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Create Button - Centered */}
            <div className="flex justify-center px-4">
              <button
                onClick={() => handlePageChange('create')}
                className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors transform -translate-y-1 flex-shrink-0"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Right side navigation items */}
            <div className="flex justify-around flex-1">
              {navigationItems.slice(3).map((item) => (
                <button
                  key={item.key}
                  onClick={() => handlePageChange(item.key)}
                  className={`flex flex-col items-center py-2 px-2 transition-colors min-w-0 ${
                    activePage === item.key ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs mt-1 truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout 