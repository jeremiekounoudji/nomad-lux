import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/stores/translationStore';
import { usePropertyTypeTranslation, useAmenitiesTranslation, useContentTranslation } from '../hooks/useTranslatedContent';
import { 
  ArrowLeft, 
  Heart, 
  Share,
  AlertCircle
} from 'lucide-react'
import { 
  Button, 
  useDisclosure
} from '@heroui/react'
import { 
  ContactHostModal,
  BookingConfirmationModal,
  BookingSuccessModal,
  BookingErrorModal
} from '../components/shared/modals'
import { BookingLoadingOverlay, PropertyHeader, PropertyMediaGallery, PropertyAmenities, PropertyHostInfo, PropertyBookingCard } from '../components/shared'
import { LazyMapWrapper } from '../components/map'
import { usePropertySettings } from '../hooks/usePropertySettings'
import { useBookingFlow } from '../hooks/useBookingFlow'
import { usePropertyShare } from '../hooks/usePropertyShare'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { calculateBookingPrice } from '../utils/priceCalculation'
import { updatePropertyMetaTags, resetDefaultMetaTags } from '../utils/shareUtils'
import type { MapCoordinates } from '../interfaces/Map'
import toast from 'react-hot-toast'
import { usePropertyLike } from '../hooks/usePropertyLike'
import { usePropertyStore } from '../lib/stores/propertyStore';
import { PropertyCardSkeleton } from '../components/shared';
import { useReview } from '../hooks/useReview';
import ReviewList from '../components/shared/ReviewList';
import CreateReviewModal from '../components/shared/modals/CreateReviewModal';
import EditReviewModal from '../components/shared/modals/EditReviewModal';
import DeleteReviewModal from '../components/shared/modals/DeleteReviewModal';



const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProperty, setSelectedProperty } = usePropertyStore();
  const { t } = useTranslation('property');

  // Simple property resolution: if selectedProperty exists and matches URL, use it
  // Otherwise, we need to redirect since we can't fetch individual properties yet
  const property = selectedProperty && selectedProperty.id === id ? selectedProperty : null;
  
  // Add comprehensive logging for property data and unavailable dates
  useEffect(() => {
    if (property) {
      console.log('🏠 PropertyDetailPage - Property loaded (after fixing transformation):', {
        id: property.id,
        title: property.title,
        status: property.status,
        timezone: property.timezone,
        unavailable_dates: property.unavailable_dates,
        unavailable_dates_count: property.unavailable_dates?.length || 0,
        unavailable_dates_sample: property.unavailable_dates?.slice(0, 3) || [],
        has_unavailable_dates: Boolean(property.unavailable_dates && property.unavailable_dates.length > 0)
      });

      // Log each unavailable date for debugging
      if (property.unavailable_dates && property.unavailable_dates.length > 0) {
        console.log('📅 PropertyDetailPage - Unavailable dates breakdown:');
        property.unavailable_dates.forEach((date, index) => {
          const dateOnly = date.split('T')[0];
          console.log(`  ${index + 1}. Full datetime: ${date} | Date only: ${dateOnly}`);
        });
      } else {
        console.log('📅 PropertyDetailPage - No unavailable dates found (this might be correct if the property has no bookings)');
      }

      // Log property structure for debugging
      console.log('🔍 PropertyDetailPage - Property structure check:', {
        has_unavailable_dates_property: 'unavailable_dates' in property,
        unavailable_dates_type: typeof property.unavailable_dates,
        is_array: Array.isArray(property.unavailable_dates),
        raw_value: property.unavailable_dates
      });
    } else {
      console.log('❌ PropertyDetailPage - No property data available');
    }
  }, [property]);
  
  // Handle back navigation - immediate response
  const handleBack = () => {
    console.log('🔙 Back button clicked, navigating back immediately');
    // Clear any pending timeouts or state updates that might interfere
    setValidationError('');
    setErrorMessage('');
    // Navigate back immediately
    navigate(-1);
  };

  // Update meta tags when property is available
  useEffect(() => {
    if (property) {
      updatePropertyMetaTags(property);
    }
    
    return () => {
      resetDefaultMetaTags();
    };
  }, [property]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false); // Remove this since we're not fetching
  const [error, setError] = useState<string | null>(null);

  // Rest of component state remains the same...
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [checkInTime, setCheckInTime] = useState('15:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isLiked, setIsLiked] = useState(property?.is_liked);



  // Translation hooks
  const { translation: propertyTypeTranslation } = usePropertyTypeTranslation(property?.property_type || '')
  const { translatedContent: translatedTitle } = useContentTranslation(
    'property',
    property?.id || '',
    'title',
    property?.title || ''
  )
  const { translatedContent: translatedDescription } = useContentTranslation(
    'property',
    property?.id || '',
    'description',
    property?.description || ''
  )
  const { translations: amenityTranslations, isLoading: amenitiesLoading } = useAmenitiesTranslation(property?.amenities || [])

  const nextMedia = () => {
    if (!property) return;
    if (mediaType === 'image') {
      if (currentImageIndex === property.images.length - 1) {
        if (property.videos.length > 0) {
          setMediaType('video');
          setCurrentVideoIndex(0);
        } else {
          setCurrentImageIndex(0);
        }
      } else {
        setCurrentImageIndex(prev => prev + 1);
      }
    } else {
      if (currentVideoIndex === property.videos.length - 1) {
        setMediaType('image');
        setCurrentImageIndex(0);
      } else {
        setCurrentVideoIndex(prev => prev + 1);
      }
    }
  };

  const prevMedia = () => {
    if (!property) return;
    if (mediaType === 'image') {
      if (currentImageIndex === 0) {
        if (property.videos.length > 0) {
          setMediaType('video');
          setCurrentVideoIndex(property.videos.length - 1);
        } else {
          setCurrentImageIndex(property.images.length - 1);
        }
      } else {
        setCurrentImageIndex(prev => prev - 1);
      }
    } else {
      if (currentVideoIndex === 0) {
        setMediaType('image');
        setCurrentImageIndex(property.images.length - 1);
      } else {
        setCurrentVideoIndex(prev => prev - 1);
      }
    }
  };

  // Modal states
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure()
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onClose: onErrorClose } = useDisclosure()

  // Share hook
  const { handleShare } = usePropertyShare()

  // Loading states
  const [errorMessage, setErrorMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  // Hooks
  const { user } = useAuthStore()
  const { getPropertySettings } = usePropertySettings()
  const { 
    createBooking
  } = useBookingFlow()
  const { isCreatingBooking, isCheckingAvailability } = useBookingStore()

  // Property settings state
  const [propertySettings, setPropertySettings] = useState<any>(null)

  // Like hook
  const { likedPropertyIds, isLoading: isLikeLoading, toggleLike, isLiked: isPropertyLiked } = usePropertyLike()

  // Review hook
  const {
    reviews,
    reviewStats,
    loading: reviewsLoading,
    error: reviewsError,
    modalState,
    filters,
    handleFilterChange,
    handlePageChange,
    loadMoreReviews,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview
  } = useReview(property?.id)

  // TODO: Review notifications and reminders
  // This would check if the user has completed bookings that they can review
  // and show appropriate notifications or reminders
  useEffect(() => {
    if (user && property) {
      // Placeholder for review notification logic
      // In a real implementation, this would:
      // 1. Check if user has completed bookings for this property
      // 2. Check if user has already reviewed those bookings
      // 3. Show appropriate notifications or reminders
      console.log('📝 Review notification placeholder - User:', user.id, 'Property:', property.id)
    }
  }, [user, property])

  // Load property settings and update meta tags on component mount
  useEffect(() => {
    if (property?.id) {
      console.log('🔄 Loading property settings for property:', property.id);
      getPropertySettings(property.id)
        .then(settings => {
          console.log('✅ Property settings loaded:', settings);
          setPropertySettings(settings);
        })
        .catch(error => {
          console.warn('⚠️ Failed to load property settings:', error);
        });
      // Update meta tags for better link sharing
      updatePropertyMetaTags(property);
    }
  }, [property, getPropertySettings]);

  // Calculate price using the new price calculation utility
  const priceCalculation = useMemo(() => {
    if (!property || !checkIn || !checkOut || !property.price) {
      return {
        billingNights: 1,
        basePrice: property?.price || 0,
        cleaningFee: property?.cleaning_fee || 0,
        serviceFee: property?.service_fee || 0,
        totalAmount: (property?.price || 0) + (property?.cleaning_fee || 0) + (property?.service_fee || 0)
      };
    }

    try {
      return calculateBookingPrice(
        property,
        new Date(checkIn),
        new Date(checkOut),
        checkInTime,
        checkOutTime,
        guests
      )
    } catch (error) {
      console.warn('⚠️ Price calculation error:', error)
      return {
        billingNights: 1,
        basePrice: property.price,
        cleaningFee: property.cleaning_fee || 0,
        serviceFee: property.service_fee || 0,
        totalAmount: property.price + (property.cleaning_fee || 0) + (property.service_fee || 0)
      }
    }
  }, [checkIn, checkOut, checkInTime, checkOutTime, guests, property]);

  const { billingNights, basePrice, cleaningFee, serviceFee, totalAmount } = priceCalculation;

  const handleReserveClick = async () => {
    // Validate authentication
    if (!user) {
      toast.error(t('auth.messages.signInToBook'))
      return
    }

    // Validate required fields
    if (!checkIn || !checkOut) {
      setValidationError(t('booking.validation.selectDates'))
      return
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
      setValidationError(t('booking.validation.checkoutAfterCheckin'))
      return
    }

    // Check property settings for booking rules with defaults
    if (propertySettings) {
      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)
      const today = new Date()
      
      // Use default values if settings are null (as per BookingSystemImplementationPlan.md)
      const minAdvanceBooking = propertySettings.min_advance_booking || 1
      const minStayNights = propertySettings.min_stay_nights || 1
      const maxStayNights = propertySettings.max_stay_nights || 30
      
      // Check minimum advance booking
      const daysDifference = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDifference < minAdvanceBooking) {
        setValidationError(t('booking.validation.minAdvanceBooking', { days: minAdvanceBooking }))
        return
      }

      // Check minimum stay length
      if (billingNights < minStayNights) {
        setValidationError(t('validation.minimumStay', { nights: minStayNights }))
        return
      }
      
      // Check maximum stay length
      if (billingNights > maxStayNights) {
        setValidationError(t('validation.maximumStay', { nights: maxStayNights }))
        return
      }
    }
    
    // Since we have property data loaded and calendar shows availability,
    // we can skip the RPC call and do basic validation
    console.log('✅ Using loaded property data, skipping RPC availability check')
    
    // Clear validation error and open confirmation dialog
    setValidationError('')
    onConfirmOpen()
  }

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error(t('auth.messages.signInToBook'))
      return
    }

    if (!property) {
      toast.error(t('booking.messages.propertyDataMissing'))
      onConfirmClose()
      return
    }

    onConfirmClose()
    
    try {
      console.log('🔄 Creating booking...')
      
      // Create booking form data and price breakdown for the API
      const bookingForm = {
        property_id: property.id,
        check_in_date: new Date(checkIn),
        check_out_date: new Date(checkOut),
        check_in_time: '15:00', // Default check-in time
        check_out_time: '11:00', // Default check-out time
        guest_count: guests,
        special_requests: specialRequests || undefined
      }
      
      const priceBreakdownData = {
        basePrice,
        cleaningFee,
        serviceFee,
        taxes: 0, // You can calculate taxes if needed
        totalAmount,
        billingNights,
        totalHours: billingNights * 24,
        minimumChargeApplied: false,
        currency: property.currency || 'USD'
      }
      
      console.log('📤 Booking form data:', bookingForm)
      console.log('📤 Price breakdown:', priceBreakdownData)
      
      const result = await createBooking(bookingForm)
      
      if (result) {
        console.log('✅ Booking created successfully:', result)
        
        // TODO: Review trigger - This would be called when a booking is completed
        // For now, we'll add a placeholder for the review trigger system
        // Reviews should be created after the stay is completed, not immediately after booking
        console.log('📝 Review trigger placeholder - Booking result:', result)
        
        onSuccessOpen()
      } else {
        throw new Error(t('messages.bookingCreationFailed'))
      }
    } catch (error) {
      console.error('❌ Booking creation failed:', error)
      const errorMsg = error instanceof Error ? error.message : t('common.messages.unexpectedError')
      setErrorMessage(errorMsg)
      onErrorOpen()
    }
  }

  const handleContactMessage = (message: string) => {
    console.log('Message sent:', message)
    // Handle message sending
  }

  // If property is not available, show loading state briefly before redirect
  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <PropertyCardSkeleton />
          <p className="mt-4 text-gray-600">{t('property.messages.loadingDetails')}</p>
          <button 
            onClick={handleBack}
            className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300"
          >
            <ArrowLeft className="size-4" />
            {t('common.actions.goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="mb-4 size-16 text-danger-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('property.messages.couldNotLoad')}</h2>
        <p className="mb-6 text-center text-gray-600">{error}</p>
        <Button onClick={() => navigate('/')} startContent={<ArrowLeft />}>
          {t('common.actions.backToHome')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="z-50 shrink-0 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex items-center  justify-between">
          <button 
            onClick={handleBack}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="size-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => property && toggleLike(property.id)}
              className="flex items-center gap-1 rounded-full p-2 transition-colors hover:bg-gray-100"
              disabled={isLikeLoading}
            >
              <Heart className={`size-6 ${property && isPropertyLiked(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              <span className="text-xs font-semibold text-gray-700">{property?.like_count ?? 0}</span>
            </button>
            <button 
              onClick={() => property && handleShare(property)}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <Share className="size-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container with Scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto">
          {!property ? (
            // Loading or error state
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
                <p className="text-gray-600">{t('property.messages.loading', 'Loading property details...')}</p>
              </div>
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <PropertyMediaGallery
                  property={property}
                  currentImageIndex={currentImageIndex}
                  setCurrentImageIndex={setCurrentImageIndex}
                  mediaType={mediaType}
                  setMediaType={setMediaType}
                  currentVideoIndex={currentVideoIndex}
                  setCurrentVideoIndex={setCurrentVideoIndex}
                  nextMedia={nextMedia}
                  prevMedia={prevMedia}
                />

                <PropertyHeader
                  property={property}
                  translatedTitle={translatedTitle}
                  translatedDescription={translatedDescription}
                />

                <PropertyAmenities
                  amenities={property.amenities}
                  amenityTranslations={amenityTranslations}
                />

                <PropertyHostInfo
                  property={property}
                  onContactOpen={onContactOpen}
                />

                {/* Reviews Section */}
                <div className="mt-8">
                  {/* Review Summary */}
                  <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {reviewStats?.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t('review.reviews.averageRating', { rating: reviewStats?.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0' })}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {reviewStats?.total_reviews || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t('review.reviews.totalReviews', { count: reviewStats?.total_reviews || 0 })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Write Review Button - Show for all logged-in users */}
                      {user && (
                        <Button
                          className="bg-main text-white hover:bg-main/90"
                          size="sm"
                          onPress={() => {
                            // Open public review modal
                            openCreateModal('property')
                          }}
                        >
                          {t('review.createReview')}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {t('review.reviews.title')}
                    </h2>
                  </div>
                  
                  <ReviewList
                    reviews={reviews}
                    loading={reviewsLoading}
                    error={reviewsError}
                    hasMore={reviews.length < (reviewStats?.total_reviews || 0)}
                    currentPage={filters.page || 1}
                    totalCount={reviewStats?.total_reviews || 0}
                    averageRating={reviewStats?.average_rating || 0}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onPageChange={handlePageChange}
                    onLoadMore={loadMoreReviews}
                    onEditReview={openEditModal}
                    onDeleteReview={openDeleteModal}
                    showActions={Boolean(user && property?.host?.id === user.id)}
                  />
                  

                </div>

                {/* Location */}
                <div className="mt-8">
                  <h2 className="mb-4 text-2xl font-semibold">{t('property.location.title')}</h2>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <LazyMapWrapper
                      key={property.id}
                      type="property"
                      property={property}
                      height="400px"
                      showNearbyAmenities={false}
                      showDirections={true}
                      showRadius={false}
                      onContactHost={() => onContactOpen()}
                      onDirectionsRequest={(coordinates: MapCoordinates) => {

                        const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
                        window.open(url, '_blank');
                      }}
                    />
                    
                    {/* Location Info card temporarily disabled */}
                    {/*
                    <div className="p-6 border-t border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {`${property.location.city}, ${property.location.country}`}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            Explore the neighborhood and discover what makes this location special.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>• Safe, well-connected area</span>
                            <span>• Close to local amenities</span>
                            <span>• Easy transportation access</span>
                          </div>
                        </div>
                        <Button
                          variant="light"
                          size="sm"
                          startContent={<Navigation className="w-4 h-4" />}
                          onClick={() => {
                            const url = getDirectionsUrl(property);
                            window.open(url, '_blank');
                          }}
                        >
                          Get Directions
                        </Button>
                      </div>
                    </div>
                    */}
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <PropertyBookingCard
                  property={property}
                  checkIn={checkIn}
                  setCheckIn={setCheckIn}
                  checkOut={checkOut}
                  setCheckOut={setCheckOut}
                  checkInTime={checkInTime}
                  setCheckInTime={setCheckInTime}
                  checkOutTime={checkOutTime}
                  setCheckOutTime={setCheckOutTime}
                  guests={guests}
                  setGuests={setGuests}
                  specialRequests={specialRequests}
                  setSpecialRequests={setSpecialRequests}
                  validationError={validationError}
                  setValidationError={setValidationError}
                  billingNights={billingNights}
                  basePrice={basePrice}
                  cleaningFee={cleaningFee}
                  serviceFee={serviceFee}
                  totalAmount={totalAmount}
                  isCheckingAvailability={isCheckingAvailability}
                  isCreatingBooking={isCreatingBooking}
                  onReserveClick={handleReserveClick}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals - Moved outside main content to ensure proper z-index */}
      <BookingConfirmationModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        billingNights={billingNights}
        specialRequests={specialRequests}
        basePrice={basePrice}
        cleaningFee={cleaningFee}
        serviceFee={serviceFee}
        totalAmount={totalAmount}
        isCreatingBooking={isCreatingBooking}
        onConfirmBooking={handleConfirmBooking}
      />

      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        totalAmount={totalAmount}
      />

      <BookingErrorModal
        isOpen={isErrorOpen}
        onClose={onErrorClose}
        errorMessage={errorMessage}
        onTryAgain={onConfirmOpen}
      />

      <BookingLoadingOverlay isVisible={isCreatingBooking} />

      {/* ContactHostModal moved outside main content container */}
      <ContactHostModal
        isOpen={isContactOpen}
        onClose={onContactClose}
        property={property}
        onSendMessage={handleContactMessage}
      />

      {/* Review Modals */}
      <CreateReviewModal
        isOpen={modalState.isOpen && modalState.mode === 'create'}
        onClose={closeModal}
        reviewType={modalState.reviewType || 'property'}
        propertyId={property?.id}
      />

      <EditReviewModal
        isOpen={modalState.isOpen && modalState.mode === 'edit'}
        onClose={closeModal}
        reviewId={modalState.reviewId || ''}
        propertyId={property?.id}
      />

      <DeleteReviewModal
        isOpen={modalState.isOpen && modalState.mode === 'delete'}
        onClose={closeModal}
        reviewId={modalState.reviewId || ''}
        propertyId={property?.id}
      />
    </div>
  )
}

export default PropertyDetailPage 