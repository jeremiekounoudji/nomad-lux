import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PopularPlaces from '../components/shared/PopularPlaces'
import { HomePagePropertyCard, PropertyCardSkeleton, PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { CityPropertiesView } from '../components/features/search/CityPropertiesView'

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
import { RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import WalletPage from './WalletPage'
import { useTranslation } from '../lib/stores/translationStore'

// Tutorial imports
import { useTutorial } from '../hooks/useTutorial'
import { TutorialModal } from '../components/shared/TutorialModal'
import { getAllTutorialSteps } from '../utils/tutorialContent'

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
  // const [selectedProperty, setSelectedPropertyState] = useState<Property | null>(null); // Commented out to avoid unused variable warning
  const [selectedCity, setSelectedCity] = useState<PopularPlace | null>(null);
  const [cityProperties, setCityProperties] = useState<Property[]>([])
  const [cityPropertiesLoading, setCityPropertiesLoading] = useState(false)
  const [cityPropertiesError, setCityPropertiesError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState('home')

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false)
  const tutorialSteps = getAllTutorialSteps()
  const {
    tutorialState,
    userPreferences,
    startTutorial,
    closeTutorial,
    resetTutorialAndPreferences,
  } = useTutorial()



  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated, isLoading, user } = useAuthStore()
  const { settings, isLoading: settingsLoading, fetchSettings } = useAdminSettings()
  const { handleShare: shareProperty } = usePropertyShare()

  // Use our new home feed hook
  const {
    // Popular places
    // popularPlaces, // Commented out to avoid unused variable warning
    // popularPlacesLoading, // Commented out to avoid unused variable warning
    popularPlacesError,
    
    // Properties feed
    properties,
    feedLoading,
    feedError,
    isLoadingMore,
    hasNextPage,
    // totalCount, // Commented out to avoid unused variable warning
    
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

  // Show error toasts when there are errors
  useEffect(() => {
    if (feedError) {
      toast.error(feedError)
    }
  }, [feedError])

  useEffect(() => {
    if (cityPropertiesError) {
      toast.error(cityPropertiesError)
    }
  }, [cityPropertiesError])

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

  // Tutorial trigger logic - show every time until user completes or sets never show again
  useEffect(() => {
    if (isAuthenticated && !isLoading && currentPage === 'home') {
      // Check if tutorial should be shown:
      // - NOT if user completed tutorial AND it's actually marked as completed
      // - NOT if user explicitly set "never show again"
      // - NOT if tutorial is already visible (avoid duplicate triggers)
      // - NOT if tutorial is already completed in the current session
      const hasReallyCompleted = userPreferences?.hasCompletedTutorial && tutorialState.isCompleted;
      const userNeverWantsToSee = userPreferences?.neverShowAgain;
      const isAlreadyShowing = tutorialState.isVisible;
      const isCompletedThisSession = tutorialState.isCompleted;
      
      const shouldShow = !hasReallyCompleted && !userNeverWantsToSee && !isAlreadyShowing && !isCompletedThisSession;
      
      if (shouldShow) {
        console.log('🎓 Triggering tutorial - conditions met:', {
          hasReallyCompleted,
          userNeverWantsToSee,
          isAlreadyShowing,
          isCompletedThisSession,
          shouldShow
        });
        setShowTutorial(true);
        startTutorial();
      } else {
        console.log('🎓 Tutorial not triggered:', {
          hasReallyCompleted,
          userNeverWantsToSee,
          isAlreadyShowing,
          isCompletedThisSession,
          tutorialStateCompleted: tutorialState.isCompleted,
          userPrefsCompleted: userPreferences?.hasCompletedTutorial,
          tutorialVisible: tutorialState.isVisible
        });
      }
    }
  }, [isAuthenticated, isLoading, currentPage, tutorialState.isCompleted, tutorialState.isVisible, userPreferences?.hasCompletedTutorial, userPreferences?.neverShowAgain, startTutorial]);

  // Sync local showTutorial state with global tutorialState.isVisible
  useEffect(() => {
    if (!tutorialState.isVisible && showTutorial) {
      console.log('🎓 Syncing local tutorial state - closing modal');
      setShowTutorial(false);
    }
  }, [tutorialState.isVisible, showTutorial]);

  // Developer utility: Add global reset function for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).resetTutorial = () => {
        console.log('🆕 Resetting tutorial for development testing');
        resetTutorialAndPreferences();
        // Force a re-render to trigger the useEffect
        setCurrentPage('temp');
        setTimeout(() => setCurrentPage('home'), 10);
      };
      
      (window as unknown as Record<string, unknown>).showTutorialState = () => {
        console.log('🎓 Current tutorial state:', {
          tutorialState,
          userPreferences,
          isAuthenticated,
          isLoading,
          currentPage
        });
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as unknown as Record<string, unknown>).resetTutorial;
        delete (window as unknown as Record<string, unknown>).showTutorialState;
      }
    };
  }, [tutorialState, userPreferences, isAuthenticated, isLoading, currentPage, resetTutorialAndPreferences]);

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
        setCityPropertiesError(t('messages.noPropertiesInCity', { city: city.name }));
      }
      
    } catch (error) {
      // The hook already shows a toast, so we just set the local error state
      console.error('❌ Error fetching city properties in component:', error);
      setCityPropertiesError(t('messages.failedToLoadProperties'));
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

  // const handleBook = (property: Property) => { // Commented out to avoid unused variable warning
  //   if (!isAuthenticated) {
  //     toast.error(t('common.messages.signInToBook'))
  //     setCurrentPage('login')
  //     return
  //   }
  //   console.log('📅 Book property:', property.title)
  //   // TODO: Implement booking modal
  //   toast.success(t('common.messages.bookingComingSoon'))
  // }

  const handlePropertyClick = useCallback((property: Property) => {
    console.log('🏠 Property clicked:', property.title);
    handlePropertyView(property.id);
    setSelectedProperty(property); // Set in Zustand store
    navigate(`/property/${property.id}`);
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

  // const handleBackToCityList = () => { // Commented out to avoid unused variable warning
  //   setSelectedProperty(null);
  // }

  // const handlePageChange = (page: string) => { // Commented out to avoid unused variable warning
  //   console.log('🔄 Page change requested:', page)

  //   // Handle profile page - redirect to profile route
  //   if (page === 'profile') {
  //     if (!isAuthenticated) {
  //       toast.error(t('common.messages.signInToAccessProfile'))
  //       setCurrentPage('login')
  //       return
  //     }
  //     // Navigate to profile page instead of opening modal
  //     navigate('/profile')
  //     return
  //   }

  //   // Check if page requires authentication
  //   if (protectedPages.includes(page) && !isAuthenticated && !isLoading) {
  //     console.log('🔒 Protected page access denied:', page)
  //     toast.error(t('common.messages.signInRequired'))
  //     setCurrentPage('login')
  //     return
  //   }
    
  //   setCurrentPage(page);
  //   setSelectedProperty(null);
  // }

  const handleLogin = () => {
    console.log('✅ User logged in successfully')
    setCurrentPage('home')
  }

  // const handleRegister = () => { // Commented out to avoid unused variable warning
  //   console.log('✅ User registered successfully')
  //   setCurrentPage('home')
  // }



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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
                  <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 animate-pulse items-center justify-center rounded-full bg-primary-500">
              <span className="text-xl font-bold text-white">NL</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">{t('common.messages.loading')}</h2>
            <p className="mb-4 text-gray-600">{t('common.messages.settingUp')}</p>
          
          {/* Emergency override button */}
          <button
            onClick={() => {
              console.log('🚨 Emergency loading override activated')
              const { setLoading } = useAuthStore.getState()
              setLoading(false)
            }}
            className="text-sm text-gray-500 underline hover:text-primary-600"
          >
            {t('common.messages.takingTooLong')}
          </button>
        </div>
      </div>
    )
  }

  // This is a legacy state management that should be removed.
  // We now use routing for page navigation.
  // if (selectedProperty) {
  //   return null; // Should be handled by router now
  // }

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
      // Don't render LoginPage if user is authenticated and loading is complete
      // This prevents the white screen blink during auth transition
      if (isAuthenticated && !isLoading) {
        return null; // Let the default home page render
      }
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
      {/* Tutorial Modal */}
      <TutorialModal
        steps={tutorialSteps}
        isOpen={showTutorial}
        onClose={() => {
          console.log('🎓 Tutorial modal closed')
          setShowTutorial(false)
          closeTutorial()
        }}
      />

      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Home Banner */}
        <div className="col-span-1 mb-6 md:col-span-2 lg:col-span-4">
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
        <div className="col-span-1 rounded-xl border border-gray-200 bg-white p-4 md:col-span-2 lg:col-span-4">
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
          <div className="col-span-1 mb-6 md:col-span-2 lg:col-span-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="mx-auto mb-3 size-12 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-red-900">
                {t('messages.failedToLoad')}
              </h3>
              <Button
                variant="flat"
                color="danger"
                onPress={handleRetry}
                startContent={<RefreshCw className="size-4" />}
              >
                {t('common.buttons.tryAgain')}
              </Button>
            </div>
          </div>
        )}

        {/* Properties Feed Loading State */}
        {feedLoading && properties.length === 0 && (
          <React.Fragment>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="col-span-1">
                <PropertyCardSkeleton />
              </div>
            ))}
          </React.Fragment>
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
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl text-gray-400">🏠</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('messages.noProperties')}
              </h3>
              <p className="mb-4 text-gray-600">
                {t('messages.noPropertiesInArea')}
              </p>
              <div className="flex justify-center gap-3">
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
                  startContent={<RefreshCw className="size-4" />}
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
            className="col-span-1 py-8 md:col-span-2 lg:col-span-4"
          >
            {isLoadingMore ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="col-span-1 py-8 text-center md:col-span-2 lg:col-span-4">
            <p className="text-gray-500">
              🎉 {t('messages.seenAllProperties')}
            </p>
            <Button
              variant="light"
              size="sm"
              onPress={handleRefresh}
              className="mt-2"
              startContent={<RefreshCw className="size-4" />}
            >
              {t('common.buttons.refreshForNewListings')}
          </Button>
        </div>
      )}


      </div>
    </div>
    </>
  )
}

export default HomePage 