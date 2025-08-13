import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PopularPlaces from '../components/shared/PopularPlaces'
import { HomePagePropertyCard, PropertyCardSkeleton, CityPropertyCard, PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
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
import { usePropertyStore } from '../lib/stores/propertyStore';
import { Property } from '../interfaces'
import { Button } from '@heroui/react'
import { RefreshCw, AlertCircle, ArrowLeft, MapPin } from 'lucide-react'
import { SharePropertyModal } from '../components/shared/modals'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import WalletPage from './WalletPage'
import { useTranslation } from '../lib/stores/translationStore'

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
  const { t } = useTranslation(['property', 'common', 'home'])
  const navigate = useNavigate();
  const { setSelectedProperty } = usePropertyStore();
  const [selectedProperty, setSelectedPropertyState] = useState<Property | null>(null);
  const [selectedCity, setSelectedCity] = useState<PopularPlace | null>(null);
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
                toast.error(t('common.messages.signInRequired'))
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
      toast.error(t('common.messages.signInToBook'))
      setCurrentPage('login')
      return
    }
    console.log('📅 Book property:', property.title)
    // TODO: Implement booking modal
          toast.success(t('common.messages.bookingComingSoon'))
  }

  const handlePropertyClick = useCallback((property: Property) => {
    console.log('🏠 Property clicked:', property.title);
    handlePropertyView(property.id);
    setSelectedProperty(property); // Set in Zustand store
    navigate(`/properties/${property.id}`);
  }, [handlePropertyView, setSelectedProperty, navigate]);

  const handleCityClick = useCallback((place: PopularPlace) => {
    console.log('🏙️ City clicked:', place.name)
    setSelectedCity(place)
    fetchCityProperties(place)
  }, [fetchCityProperties])

  const handleBackToHome = () => {
    setSelectedProperty(null);
    setSelectedCity(null);
    setCityProperties([]);
    setCityPropertiesError(null);
    setCurrentPage('home');
  }

  const handleBackToCityList = () => {
    setSelectedProperty(null);
  }

  const handlePageChange = (page: string) => {
    console.log('🔄 Page change requested:', page)

    // Handle profile modal
    if (page === 'profile') {
      if (!isAuthenticated) {
        toast.error(t('common.messages.signInToAccessProfile'))
        setCurrentPage('login')
        return
      }
      setIsProfileModalOpen(true)
      return
    }

    // Check if page requires authentication
    if (protectedPages.includes(page) && !isAuthenticated && !isLoading) {
      console.log('🔒 Protected page access denied:', page)
      toast.error(t('common.messages.signInRequired'))
      setCurrentPage('login')
      return
    }
    
    setCurrentPage(page);
    setSelectedProperty(null);
    setIsProfileModalOpen(false);
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
          toast.success(t('common.messages.feedRefreshed'))
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.messages.loading')}</h2>
            <p className="text-gray-600 mb-4">{t('common.messages.settingUp')}</p>
          
          {/* Emergency override button */}
          <button
            onClick={() => {
              console.log('🚨 Emergency loading override activated')
              const { setLoading } = useAuthStore.getState()
              setLoading(false)
            }}
            className="text-sm text-gray-500 hover:text-primary-600 underline"
          >
            {t('common.messages.takingTooLong')}
          </button>
        </div>
      </div>
    )
  }

  // This is a legacy state management that should be removed.
  // We now use routing for page navigation.
  if (selectedProperty) {
    return null; // Should be handled by router now
  }

  // City Properties View
  if (selectedCity) {
    return (
      // <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
        
      // </MainLayout>
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
    );
  }

  // This switch statement is also legacy and should be removed
  // as routing handles page changes.
  switch (currentPage) {
    case 'create':
      return <CreatePropertyPage  />
    case 'liked':
      return <LikedPropertiesPage  />
    case 'bookings':
      return <MyBookingsPage  />
    case 'listings':
      return <MyListingsPage  />
    case 'notifications':
      return <NotificationsPage />
    case 'requests':
      return <BookingRequestsPage  />
    case 'help':
      return <HelpPage />
    case 'terms':
      return <TermsPage  />
    case 'login':
      return <LoginPage  onLogin={handleLogin} />
    case 'register':
      return <RegisterPage />
    case 'search':
      return <SearchPage />
    case 'admin-login':
      return <AdminLoginPage  />
    case 'admin-register':
      return <AdminRegisterPage/>
    case 'admin':
      return <AdminPage />
    case 'wallet':
      return <WalletPage />
    default:
      break;
  }

  // Default home page view (protected)
  return (
    <>
        {/* Home Banner */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <PageBanner
            backgroundImage={getBannerConfig('home').image}
            title={t('home.discoverLuxury')}
            subtitle={t('home.findPerfectStay')}
            imageAlt={t('common.pageBanner.home')}
            overlayOpacity={getBannerConfig('home').overlayOpacity}
            height={getBannerConfig('home').height}
          />
        </div>

        {/* Popular Places Section - Full width across all columns */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4">
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
                {t('messages.failedToLoad')}
              </h3>
              <p className="text-red-700 mb-4">{feedError}</p>
              <Button
                variant="flat"
                color="danger"
                onPress={handleRetry}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                {t('common.buttons.tryAgain')}
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
          <div key={property.id}>
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
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('messages.noProperties')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('messages.noPropertiesInArea')}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => getUserLocation()}
                >
                  📍 {t('common.buttons.updateLocation')}
                </Button>
                <Button
                  variant="flat"
                  onPress={handleRefresh}
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  {t('common.buttons.refreshFeed')}
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
              🎉 {t('messages.seenAllProperties')}
            </p>
            <Button
              variant="light"
              size="sm"
              onPress={handleRefresh}
              className="mt-2"
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              {t('common.buttons.refreshForNewListings')}
          </Button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={handleProfileModalClose}
      />
    </>
  )
}

export default HomePage 