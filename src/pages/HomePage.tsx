import React, { useState, useEffect } from 'react'
import MainLayout from '../components/layout/MainLayout'
import PopularPlaces from '../components/shared/PopularPlaces'
import { HomePagePropertyCard } from '../components/shared'
import ProfileModal from '../components/shared/ProfileModal'
import PropertyDetailPage from './PropertyDetailPage'
import CreatePropertyPage from './CreatePropertyPage'
import LikedPropertiesPage from './LikedPropertiesPage'
import MyBookingsPage from './MyBookingsPage'
import MyListingsPage from './MyListingsPage'
import NotificationsPage from './NotificationsPage'
import BookingRequestsPage from './BookingRequestsPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import SearchPage from './SearchPage'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminRegisterPage } from './AdminRegisterPage'
import { AdminPage } from './AdminPage'
import { useAuthStore } from '../lib/stores/authStore'
import { useAdminSettings } from '../hooks/useAdminSettings'
import { Property } from '../interfaces'
import { mockProperties } from '../lib/mockData'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { settings, isLoading: settingsLoading, fetchSettings } = useAdminSettings()

  console.log('🏠 HomePage rendered', { 
    currentPage, 
    isAuthenticated, 
    isLoading,
    settingsLoading,
    userEmail: user?.email,
    hasSettings: !!settings,
    timestamp: new Date().toISOString() 
  })

  // Protected pages that require authentication
  const protectedPages = [
    'home', 'create', 'liked', 'bookings', 'listings', 
    'notifications', 'requests', 'search', 'profile'
  ]

  // Fetch admin settings on mount
  useEffect(() => {
    if (!settings && !settingsLoading) {
      console.log('📥 Fetching admin settings on HomePage mount')
      fetchSettings().catch(console.error)
    }
  }, [settings, settingsLoading, fetchSettings])

  // Check authentication for protected routes
  useEffect(() => {
    // Add a small delay to prevent flashing during auth initialization
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        // If user is not authenticated and trying to access a protected page
        if (!isAuthenticated && protectedPages.includes(currentPage)) {
          console.log('🔒 Protected page access denied - redirecting to login')
          toast.error('Please sign in to access this feature')
          setCurrentPage('login')
          return
        }

        // If user is authenticated and on login/register page, redirect to home
        if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
          console.log('✅ User already authenticated - redirecting to home')
          setCurrentPage('home')
          return
        }
      }
    }, 100) // Small delay to prevent flashing

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, isLoading, currentPage])

  const handleLike = (propertyId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like properties')
      setCurrentPage('login')
      return
    }
    console.log('Liked property:', propertyId)
  }

  const handleShare = (property: Property) => {
    console.log('Share property:', property.title)
  }

  const handleBook = (property: Property) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book properties')
      setCurrentPage('login')
      return
    }
    console.log('Book property:', property.title)
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const handleBackToHome = () => {
    setSelectedProperty(null)
    setCurrentPage('home')
  }

  const handlePageChange = (page: string) => {
    console.log('🔄 Page change requested:', page)

    // Handle profile modal
    if (page === 'profile') {
      if (!isAuthenticated) {
        toast.error('Please sign in to access your profile')
        setCurrentPage('login')
        return
      }
      setIsProfileModalOpen(true)
      return
    }

    // Check if page requires authentication
    if (protectedPages.includes(page) && !isAuthenticated && !isLoading) {
      console.log('🔒 Protected page access denied:', page)
      toast.error('Please sign in to access this feature')
      setCurrentPage('login')
      return
    }
    
    setCurrentPage(page)
    setSelectedProperty(null)
    setIsProfileModalOpen(false)
  }

  const handleLogin = () => {
    console.log('✅ User logged in successfully')
    setCurrentPage('home')
  }

  const handleRegister = () => {
    console.log('✅ User registered successfully')
    setCurrentPage('home')
  }

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false)
  }

  // Show loading state during authentication initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">NL</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600 mb-4">Setting up your experience</p>
          
          {/* Emergency override button */}
          <button
            onClick={() => {
              console.log('🚨 Emergency loading override activated')
              const { setLoading } = useAuthStore.getState()
              setLoading(false)
            }}
            className="text-sm text-gray-500 hover:text-primary-600 underline"
          >
            Taking too long? Click here to continue
          </button>
        </div>
      </div>
    )
  }

  // Handle different page views
  if (selectedProperty) {
    return (
      <PropertyDetailPage 
        property={selectedProperty} 
        onBack={handleBackToHome}
      />
    )
  }

  // Route to different pages
  switch (currentPage) {
    case 'create':
      return <CreatePropertyPage onPageChange={handlePageChange} />
    case 'liked':
      return <LikedPropertiesPage onPageChange={handlePageChange} />
    case 'bookings':
      return <MyBookingsPage onPageChange={handlePageChange} />
    case 'listings':
      return <MyListingsPage onPageChange={handlePageChange} />
    case 'notifications':
      return <NotificationsPage onPageChange={handlePageChange} />
    case 'requests':
      return <BookingRequestsPage onPageChange={handlePageChange} />
    case 'login':
      return <LoginPage onPageChange={handlePageChange} onLogin={handleLogin} />
    case 'register':
      return <RegisterPage onPageChange={handlePageChange} onRegister={handleRegister} />
    case 'search':
      return <SearchPage onPageChange={handlePageChange} />
    case 'admin-login':
      return <AdminLoginPage onPageChange={handlePageChange} />
    case 'admin-register':
      return <AdminRegisterPage onPageChange={handlePageChange} />
    case 'admin':
      return <AdminPage onPageChange={handlePageChange} />
    default:
      break
  }

  // Default home page view (protected)
  return (
    <>
      <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
        {/* Welcome message for authenticated users */}
        {isAuthenticated && user && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user.display_name}! 👋
              </h2>
              <p className="text-white/90">
                Ready to discover your next adventure?
              </p>
            </div>
          </div>
        )}

        {/* Popular Places Section - Full width across all columns */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <PopularPlaces />
        </div>

        {/* Property Cards - Each card takes one grid column */}
        {mockProperties.map((property) => (
          <div key={property.id} className="col-span-1">
            <HomePagePropertyCard
              property={property}
              onLike={handleLike}
              onClick={handlePropertyClick}
            />
          </div>
        ))}
      </MainLayout>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={handleProfileModalClose}
      />
    </>
  )
}

export default HomePage 