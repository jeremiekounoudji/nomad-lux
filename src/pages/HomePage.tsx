import React, { useState, useEffect, useCallback, useRef } from 'react'
import MainLayout from '../components/layout/MainLayout'
import PopularPlaces from '../components/shared/PopularPlaces'
import { HomePagePropertyCard, PropertyCardSkeleton, CityPropertyCard } from '../components/shared'
import { CityPropertiesView } from '../components/features/search/CityPropertiesView'
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
import HelpPage from './HelpPage'
import TermsPage from './TermsPage'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminRegisterPage } from './AdminRegisterPage'
import { AdminPage } from './AdminPage'
import { useAuthStore } from '../lib/stores/authStore'
import { useAdminSettings } from '../hooks/useAdminSettings'
import { useHomeFeed } from '../hooks/useHomeFeed'
import { usePropertyShare } from '../hooks/usePropertyShare'
import { Property } from '../interfaces'
import { Button } from '@heroui/react'
import { RefreshCw, AlertCircle, ArrowLeft, MapPin } from 'lucide-react'
import { SharePropertyModal } from '../components/shared/modals'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import WalletPage from './WalletPage'

// Add interface for popular place (matching the useHomeFeed hook)
interface PopularPlace {
  id: string
  name: string
  country: string
  property_count: number
  average_price: number
  featured_image: string
  coordinates: {
    lat: number
    lng: number
  }
}

const HomePage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedCity, setSelectedCity] = useState<PopularPlace | null>(null)
  const [cityProperties, setCityProperties] = useState<Property[]>([])
  const [cityPropertiesLoading, setCityPropertiesLoading] = useState(false)
  const [cityPropertiesError, setCityPropertiesError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { settings, isLoading: settingsLoading, fetchSettings } = useAdminSettings()
  const { handleShare: shareProperty } = usePropertyShare()

  // Use our new home feed hook
  const {
    // Popular places
    popularPlaces,
    popularPlacesLoading,
    popularPlacesError,
    
    // Properties feed
    properties,
    feedLoading,
    feedError,
    isLoadingMore,
    hasNextPage,
    totalCount,
    
    // User location
    userLocation,
    
    // Actions
    fetchPopularPlaces,
    fetchPropertiesFeed,
    loadMoreProperties,
    refreshFeed,
    getUserLocation,
    handleLikeProperty,
    handlePropertyView,
    fetchPropertiesByFilter,
  } = useHomeFeed()

  console.log('🏠 HomePage rendered', { 
    currentPage, 
    isAuthenticated, 
    isLoading,
    settingsLoading,
    userEmail: user?.email,
    hasSettings: !!settings,
    propertiesCount: properties.length,
    feedLoading,
    hasNextPage,
    userLocation,
    selectedCity: selectedCity?.name,
    cityPropertiesCount: cityProperties.length,
    timestamp: new Date().toISOString() 
  })

  // Protected pages that require authentication
  const protectedPages = [
    'home', 'create', 'liked', 'bookings', 'listings', 
    'notifications', 'requests', 'search', 'profile', 'wallet'
  ]

  // Fetch admin settings on mount
  useEffect(() => {
    if (!settings && !settingsLoading) {
      console.log('📥 Fetching admin settings on HomePage mount')
      fetchSettings().catch(console.error)
    }
  }, [settings, settingsLoading, fetchSettings])

  // Initialize home feed once when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && properties.length === 0 && !feedLoading) {
      console.log('🚀 Initializing home feed...')
      
      // Initialize data fetching
      getUserLocation()
      fetchPopularPlaces() 
      fetchPropertiesFeed(1, false)
    }
  }, [isAuthenticated, isLoading]) // Only essential dependencies

  // Fetch city properties when a city is selected
  const fetchCityProperties = useCallback(async (city: PopularPlace) => {
    setCityPropertiesLoading(true);
    setCityPropertiesError(null);
    
    try {
      console.log('🏙️ Fetching properties for city from hook:', city.name);
      
      const properties = await fetchPropertiesByFilter({
        search_city: city.name,
        search_country: city.country,
      });

      setCityProperties(properties);
      
      if (properties.length === 0) {
        setCityPropertiesError(`No properties found in ${city.name}.`);
      }
      
    } catch (error) {
      // The hook already shows a toast, so we just set the local error state
      console.error('❌ Error fetching city properties in component:', error);
      setCityPropertiesError('Failed to load properties. Please try again.');
    } finally {
      setCityPropertiesLoading(false);
    }
  }, [fetchPropertiesByFilter]);

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

  // Infinite scroll implementation
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isLoadingMore || feedLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('♾️ Infinite scroll triggered')
          loadMoreProperties()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isLoadingMore, feedLoading, loadMoreProperties])

  const handleLike = useCallback((propertyId: string) => {
    console.log('❤️ Like button clicked for property:', propertyId)
    handleLikeProperty(propertyId)
  }, [handleLikeProperty])

  const handleBook = (property: Property) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book properties')
      setCurrentPage('login')
      return
    }
    console.log('📅 Book property:', property.title)
    // TODO: Implement booking modal
    toast.success('Booking feature coming soon!')
  }

  const handlePropertyClick = useCallback((property: Property) => {
    console.log('🏠 Property clicked:', property.title)
    handlePropertyView(property.id)
    setSelectedProperty(property)
  }, [handlePropertyView])

  const handleCityClick = useCallback((place: PopularPlace) => {
    console.log('🏙️ City clicked:', place.name)
    setSelectedCity(place)
    fetchCityProperties(place)
  }, [fetchCityProperties])

  const handleBackToHome = () => {
    setSelectedProperty(null)
    setSelectedCity(null)
    setCityProperties([])
    setCityPropertiesError(null)
    setCurrentPage('home')
  }

  const handleBackToCityList = () => {
    setSelectedProperty(null)
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

  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing home feed')
    refreshFeed()
    toast.success('Feed refreshed!')
  }, [refreshFeed])

  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying failed requests')
    if (popularPlacesError) {
      fetchPopularPlaces()
    }
    if (feedError) {
      fetchPropertiesFeed(1, false)
    }
  }, [popularPlacesError, feedError, fetchPopularPlaces, fetchPropertiesFeed])

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
        onBack={selectedCity ? handleBackToCityList : handleBackToHome}
      />
    )
  }

  // City Properties View
  if (selectedCity) {
    return (
      <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
        <CityPropertiesView
          selectedCity={selectedCity}
          cityProperties={cityProperties}
          cityPropertiesError={cityPropertiesError}
          cityPropertiesLoading={cityPropertiesLoading}
          onBackToHome={handleBackToHome}
          onRefetch={fetchCityProperties}
          onPropertyClick={handlePropertyClick}
          onLike={handleLike}
          onShare={shareProperty}
        />
      </MainLayout>
    );
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
    case 'help':
      return <HelpPage onPageChange={handlePageChange} />
    case 'terms':
      return <TermsPage onPageChange={handlePageChange} />
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
    case 'wallet':
      return <WalletPage />
    default:
      break
  }

  // Default home page view (protected)
  return (
    <>
      <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
        {/* Popular Places Section - Full width across all columns */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <PopularPlaces 
            onPlaceClick={handleCityClick}
            onExploreClick={() => {
              console.log('🔍 Explore clicked - navigating to search')
              setCurrentPage('search')
            }}
          />
        </div>

        {/* Properties Feed Error State */}
        {feedError && !feedLoading && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to Load Properties
              </h3>
              <p className="text-red-700 mb-4">{feedError}</p>
              <Button
                variant="flat"
                color="danger"
                onPress={handleRetry}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Properties Feed Loading State */}
        {feedLoading && properties.length === 0 && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="col-span-1">
                <PropertyCardSkeleton />
              </div>
            ))}
          </>
        )}

        {/* Property Cards - Each card takes one grid column */}
        {properties.map((property) => (
          <div key={property.id} className="col-span-1">
            <HomePagePropertyCard
              property={property}
              onLike={handleLike}
              onShare={shareProperty}
              onClick={handlePropertyClick}
            />
          </div>
        ))}

        {/* No properties state */}
        {!feedLoading && !feedError && properties.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any properties in your area. Try expanding your search or check back later.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => getUserLocation()}
                >
                  📍 Update Location
                </Button>
                <Button
                  variant="flat"
                  onPress={handleRefresh}
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh Feed
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && (
          <div 
            ref={loadMoreRef}
            className="col-span-1 md:col-span-2 lg:col-span-3 py-8"
          >
            {isLoadingMore ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <PropertyCardSkeleton key={`loading-more-${index}`} />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  variant="flat"
                  color="primary"
                  onPress={loadMoreProperties}
                  isLoading={isLoadingMore}
                >
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        )}

        {/* End of feed indicator */}
        {!hasNextPage && properties.length > 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
            <p className="text-gray-500">
              🎉 You've seen all available properties!
            </p>
            <Button
              variant="light"
              size="sm"
              onPress={handleRefresh}
              className="mt-2"
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              Refresh for new listings
            </Button>
          </div>
        )}
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