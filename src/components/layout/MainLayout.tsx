import React from 'react'
import { Home, Heart, Plus, Calendar, User, Menu, Search, Bell, ClipboardList, X, LogOut, HelpCircle, Shield, LogIn, UserPlus, Crown, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../lib/stores/authStore'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { useNavigation } from '../../hooks/useNavigation'
import Sidebar from './Sidebar'
import toast from 'react-hot-toast'

const MainLayout: React.FC = () => {
  const location = useLocation()
  const { signOut } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const { 
    isDrawerOpen,
    closeDrawer,
    openDrawer,
    toggleDrawer,
    navigateWithAuth
  } = useNavigation()
  
  const drawerItems = [
    { path: ROUTES.SEARCH, label: 'Search', icon: Search },
    { path: ROUTES.MY_LISTINGS, label: 'My Listings', icon: Home, requireAuth: true },
    { path: ROUTES.BOOKING_REQUESTS, label: 'Booking Requests', icon: ClipboardList, requireAuth: true },
    { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell, requireAuth: true },
    { path: ROUTES.WALLET, label: 'Wallet', icon: Wallet, requireAuth: true },
    { path: ROUTES.HELP, label: 'Help Center', icon: HelpCircle },
    { path: ROUTES.TERMS, label: 'Terms & Conditions', icon: Shield },
    ...(isAuthenticated ? [] : [
      { path: ROUTES.LOGIN, label: 'Login', icon: LogIn },
      { path: ROUTES.REGISTER, label: 'Register', icon: UserPlus },
    ]),
    { path: ROUTES.ADMIN_LOGIN, label: 'Admin Access', icon: Crown }
  ]

  const handleLogout = async () => {
    try {
      console.log('🚪 User logout initiated')
      await signOut()
      toast.success('Logged out successfully')
      closeDrawer()
      navigateWithAuth(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {/* Left: Menu/Drawer */}
            <button 
              onClick={() => toggleDrawer()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Center: Nomad Lux Name */}
            <NavLink to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NL</span>
              </div>
              <span className="font-script font-bold text-xl text-primary-600">
                Nomad Lux
              </span>
            </NavLink>
            
            {/* Right: Search and Notification */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <NavLink 
                to={ROUTES.SEARCH}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </NavLink>
              <NavLink 
                to={ROUTES.NOTIFICATIONS}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></div>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeDrawer}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <NavLink to={ROUTES.HOME} className="flex items-center gap-3 min-w-0 flex-1" onClick={closeDrawer}>
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">NL</span>
                </div>
                <span className="font-script font-bold text-2xl text-primary-600 truncate">
                  Nomad Lux
                </span>
              </NavLink>
              <button 
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Profile Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff`}
                  alt={user.display_name}
                  className="w-12 h-12 rounded-full ring-2 ring-secondary-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.display_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="truncate">@{user.username || user.email.split('@')[0]}</span>
                    {user.is_email_verified && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{user.user_role === 'both' ? 'Host & Guest' : user.user_role}</span>
                    <span>⭐ {(user.guest_rating ?? 0).toFixed(1)}</span>
                    {user.is_host && (
                      <span>🏠 {user.total_properties}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full ring-2 ring-secondary-200 flex-shrink-0 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">Guest User</h3>
                  <p className="text-sm text-gray-500 truncate">Not signed in</p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {drawerItems.map((item) => (
                (!item.requireAuth || isAuthenticated) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeDrawer}
                    className={({ isActive }) => `
                      w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 min-w-0
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'
                    }`} />
                    <span className="text-base truncate">{item.label}</span>
                  </NavLink>
                )
              ))}
            </nav>

            {/* Logout */}
            {isAuthenticated && (
              <div className="mt-8 pt-4 border-t border-gray-100 px-3">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 min-w-0"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base truncate">Logout</span>
                </button>
              </div>
            )}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigateWithAuth(ROUTES.SEARCH)
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <NavLink 
              to={ROUTES.NOTIFICATIONS}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></div>
            </NavLink>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout 