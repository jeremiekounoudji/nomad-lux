import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Award, 
  MessageCircle, 
  CheckCircle,
  Eye,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Clock,
  MessageSquare,
  CheckCircle2,
  Mail,
  Phone,
  Home,
  Tv,
  Coffee,
  Snowflake,
  Flame,
  DoorClosed,
  Shirt,
  Dumbbell,
  Waves as Pool,
  TreeDeciduous as TreePine,
  Dog as PawPrint,
  Baby,
  Car as Parking,
  Wind,
  Play,
  Image as ImageIcon,
  Navigation
} from 'lucide-react'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Avatar, 
  Button, 
  Divider, 
  Badge, 
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import { PropertyDetailPageProps } from '../interfaces/Component'
import { Property } from '../interfaces/Property'
import { 
  SharePropertyModal, 
  ContactHostModal
} from '../components/shared/modals'
import { BookingCalendar } from '../components/shared'
import { LazyMapWrapper } from '../components/map'
import { usePropertySettings } from '../hooks/usePropertySettings'
import { useBookingFlow } from '../hooks/useBookingFlow'
import { usePropertyShare } from '../hooks/usePropertyShare'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { calculateBookingPrice } from '../utils/priceCalculation'
import { updatePropertyMetaTags, resetDefaultMetaTags } from '../utils/shareUtils'
import { getDirectionsUrl } from '../utils/propertyUtils'
import type { MapCoordinates } from '../interfaces/Map'
import toast from 'react-hot-toast'
import { usePropertyLike } from '../hooks/usePropertyLike'
import { usePropertyStore } from '../lib/stores/propertyStore';
import { PropertyCardSkeleton } from '../components/shared';

const getAmenityIcon = (amenity: string) => {
  const amenityMap: { [key: string]: React.ReactNode } = {
    'wifi': <Wifi className="w-5 h-5" />,
    'tv': <Tv className="w-5 h-5" />,
    'kitchen': <Utensils className="w-5 h-5" />,
    'air_conditioning': <Wind className="w-5 h-5" />,
    'heating': <Flame className="w-5 h-5" />,
    'washer': <Shirt className="w-5 h-5" />,
    'dryer': <Shirt className="w-5 h-5" />,
    'gym': <Dumbbell className="w-5 h-5" />,
    'pool': <Pool className="w-5 h-5" />,
    'parking': <Parking className="w-5 h-5" />,
    'elevator': <DoorClosed className="w-5 h-5" />,
    'coffee_maker': <Coffee className="w-5 h-5" />,
    'workspace': <Home className="w-5 h-5" />,
    'pet_friendly': <PawPrint className="w-5 h-5" />,
    'baby_friendly': <Baby className="w-5 h-5" />,
    'garden_view': <TreePine className="w-5 h-5" />
  }
  return amenityMap[amenity.toLowerCase()] || <CheckCircle2 className="w-5 h-5" />
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProperty, setSelectedProperty } = usePropertyStore();

  // Simple property resolution: if selectedProperty exists and matches URL, use it
  // Otherwise, we need to redirect since we can't fetch individual properties yet
  const property = selectedProperty && selectedProperty.id === id ? selectedProperty : null;
  
  // If no property data is available after a short delay, redirect to home
  useEffect(() => {
    if (!property) {
      const timer = setTimeout(() => {
        console.log('❌ No property data available, redirecting to home');
        toast.error("Property not found. Please try again from the main page.");
        navigate('/');
      }, 1000); // Give 1 second for any store updates

      return () => clearTimeout(timer);
    } else {
      // Update meta tags when property is available
      updatePropertyMetaTags(property);
    }
    
    return () => {
      resetDefaultMetaTags();
    };
  }, [property, navigate, id]);

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

  // Combine all media for the counter
  const allMedia = [...(property?.images || []), ...(property?.videos || [])];
  const currentOverallIndex = mediaType === 'image' 
    ? currentImageIndex 
    : (property?.images?.length || 0) + currentVideoIndex;

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
      toast.error('Please sign in to make a booking')
      return
    }

    // Validate required fields
    if (!checkIn || !checkOut) {
      setValidationError('Please select check-in and check-out dates')
      return
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
      setValidationError('Check-out date must be after check-in date')
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
        setValidationError(`Minimum ${minAdvanceBooking} day(s) advance booking required`)
        return
      }

      // Check minimum stay length
      if (billingNights < minStayNights) {
        setValidationError(`Minimum stay is ${minStayNights} night(s)`)
        return
      }
      
      // Check maximum stay length
      if (billingNights > maxStayNights) {
        setValidationError(`Maximum stay is ${maxStayNights} night(s)`)
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
      toast.error('Please sign in to make a booking')
      return
    }

    if (!property) {
      toast.error('Cannot process booking: property data is missing.')
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
        onSuccessOpen()
      } else {
        throw new Error('Booking creation failed')
      }
    } catch (error) {
      console.error('❌ Booking creation failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.'
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
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PropertyCardSkeleton />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-danger-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Could Not Load Property</h2>
        <p className="text-gray-600 text-center mb-6">{error}</p>
        <Button onClick={() => navigate('/')} startContent={<ArrowLeft />}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => property && toggleLike(property.id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
              disabled={isLikeLoading}
            >
              <Heart className={`w-6 h-6 ${property && isPropertyLiked(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              <span className="text-xs text-gray-700 font-semibold">{property?.like_count ?? 0}</span>
            </button>
            <button 
              onClick={() => property && handleShare(property)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container with Scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image/Video Gallery */}
            <div className="relative mb-8">
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-xl">
                {mediaType === 'image' ? (
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={property.videos[currentVideoIndex]}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                  />
                )}
                
                {/* Navigation Buttons */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Media Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentOverallIndex + 1} / {allMedia.length}
                </div>

                {/* Media Type Indicator */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button 
                    onClick={() => {
                      if (property.images.length > 0) {
                        setMediaType('image')
                        setCurrentImageIndex(0)
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
                      mediaType === 'image' && property.images.length > 0
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    disabled={property.images.length === 0}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photos ({property.images.length})
                  </button>
                  <button 
                    onClick={() => {
                      if (property.videos.length > 0) {
                        setMediaType('video')
                        setCurrentVideoIndex(0)
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
                      mediaType === 'video' && property.videos.length > 0
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    disabled={property.videos.length === 0}
                  >
                    <Play className="w-4 h-4" />
                    Videos ({property.videos.length})
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={`img-${index}`}
                    onClick={() => {
                      setMediaType('image')
                      setCurrentImageIndex(index)
                    }}
                    className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      mediaType === 'image' && index === currentImageIndex 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {property.videos.map((video, index) => (
                  <button
                    key={`vid-${index}`}
                    onClick={() => {
                      setMediaType('video')
                      setCurrentVideoIndex(index)
                    }}
                    className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      mediaType === 'video' && index === currentVideoIndex 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <video src={video} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
                    {property.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{property.rating}</span>
                      <span>({property.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{`${property.location.city}, ${property.location.country}`}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ${property.price}
                    <span className="text-base font-normal text-gray-600 ml-1">/ night</span>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-900 font-medium text-sm">{property.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Bed className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-900 font-medium text-sm">{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Bath className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-900 font-medium text-sm">{property.bathrooms} bathrooms</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">What this place offers</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {getAmenityIcon(amenity)}
                      <span className="text-gray-700">{amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Meet your host</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-6">
                  <Avatar
                    src={property.host.avatar_url}
                    alt={property.host.name}
                    className="w-16 h-16"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-medium">{property.host.display_name}</h3>
                      {property.host.is_identity_verified && (
                        <Badge color="success" className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{property.host.rating.toFixed(1)} Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Host since {new Date(property.created_at).getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{property.host.response_rate}% Response rate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{property.host.response_time} avg. response time</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{property.host.bio || "I'm a passionate host who loves sharing beautiful spaces with travelers from around the world."}</p>
                    <div className="flex flex-wrap gap-4">
                      {property.host.is_email_verified && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>Email verified</span>
                        </div>
                      )}
                      {property.host.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>Phone verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="flat" 
                    onClick={onContactOpen}
                    className="w-full sm:w-auto bg-primary-500 text-white"
                  >
                    Contact Host
                  </Button>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Where you'll be</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    console.log('🗺️ Directions requested for:', coordinates);
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
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                      <span className="ml-1 text-gray-600">night</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">{property.rating}</span>
                      <span className="text-gray-600 text-sm">({property.review_count} reviews)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-6">
                  {/* Visual Calendar with Availability */}
                  <div className="mb-4">
                    <BookingCalendar
                      propertyId={property.id}
                      unavailableDates={property.unavailable_dates}
                      timezone={property.timezone}
                      city={property.location.city}
                      country={property.location.country}
                      selectedCheckIn={checkIn}
                      selectedCheckOut={checkOut}
                      onDateChange={(checkInDate, checkOutDate) => {
                        console.log('📅 Date change:', { checkInDate, checkOutDate })
                        if (checkInDate !== checkIn || checkOutDate !== checkOut) {
                          setCheckIn(checkInDate)
                          setCheckOut(checkOutDate)
                          setValidationError('')
                          // Show toast for date selection
                          if (checkInDate && !checkOutDate) {
                            toast.success('Check-in date selected')
                          } else if (checkInDate && checkOutDate) {
                            toast.success('Check-out date selected')
                          }
                        }
                      }}
                      onTimeChange={(checkInTimeNew, checkOutTimeNew) => {
                        console.log('🕒 Time change:', { checkInTimeNew, checkOutTimeNew })
                        if (checkInTimeNew !== checkInTime || checkOutTimeNew !== checkOutTime) {
                          setCheckInTime(checkInTimeNew)
                          setCheckOutTime(checkOutTimeNew)
                          toast.success('Time updated')
                        }
                      }}
                    />
                  </div>

                  {/* Time Selection (Manual Override) */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-IN TIME</label>
                      <input
                        type="time"
                        value={checkInTime}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const [hours, minutes] = newTime.split(':').map(Number);
                          const timeInMinutes = hours * 60 + minutes;
                          
                          // Validate check-in time (6:00 AM - 10:00 PM)
                          if (timeInMinutes < 360 || timeInMinutes > 1320) {
                            toast.error('Check-in time must be between 6:00 AM and 10:00 PM');
                            return;
                          }
                          
                          console.log('🕒 Setting check-in time:', newTime);
                          setCheckInTime(newTime);
                          toast.success('Check-in time updated');
                        }}
                        min="06:00"
                        max="22:00"
                        step="1800"
                        className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">Check-in available 6:00 AM - 10:00 PM</p>
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-OUT TIME</label>
                      <input
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const [hours, minutes] = newTime.split(':').map(Number);
                          const timeInMinutes = hours * 60 + minutes;
                          
                          // Validate check-out time (6:00 AM - 12:00 PM)
                          if (timeInMinutes < 360 || timeInMinutes > 720) {
                            toast.error('Check-out time must be between 6:00 AM and 12:00 PM');
                            return;
                          }
                          
                          console.log('🕒 Setting check-out time:', newTime);
                          setCheckOutTime(newTime);
                          toast.success('Check-out time updated');
                        }}
                        min="06:00"
                        max="12:00"
                        step="1800"
                        className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">Check-out required by 12:00 PM</p>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="border-2 border-gray-200 rounded-lg p-3 mb-4 hover:border-gray-300 transition-all focus-within:border-primary-500">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GUESTS</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-900">{guests} guest{guests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => {
                            if (guests > 1) {
                              console.log('Decreasing guests from', guests, 'to', guests - 1)
                              setGuests(prev => Math.max(1, prev - 1))
                            }
                          }}
                          isDisabled={guests <= 1}
                        >
                          <span className="text-2xl font-bold">-</span>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => {
                            if (guests < property.max_guests) {
                              console.log('Increasing guests from', guests, 'to', guests + 1)
                              setGuests(prev => Math.min(property.max_guests, prev + 1))
                            }
                          }}
                          isDisabled={guests >= property.max_guests}
                        >
                          <span className="text-2xl font-bold">+</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum {property.max_guests} guests allowed</p>
                  </div>

                  {/* Special Requests */}
                  <div className="border-2 border-gray-200 rounded-lg p-3 mb-4 hover:border-gray-300 transition-all focus-within:border-primary-500">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">SPECIAL REQUESTS (OPTIONAL)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests or notes for your host..."
                      rows={3}
                      maxLength={500}
                      className="w-full text-sm focus:outline-none bg-transparent text-gray-900 resize-none placeholder-gray-500"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Share any specific needs or preferences</span>
                      <span className="text-xs text-gray-400">{specialRequests.length}/500</span>
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <div className="mb-4">
                    <Button 
                      color="primary" 
                      size="lg" 
                      className="w-full font-bold text-lg py-4 bg-primary-600 hover:bg-primary-700"
                      radius="lg"
                      onPress={handleReserveClick}
                      startContent={<Calendar className="w-5 h-5" />}
                      isLoading={isCheckingAvailability || isCreatingBooking}
                      disabled={isCheckingAvailability || isCreatingBooking || !checkIn || !checkOut}
                    >
                      {isCheckingAvailability ? 'Checking Availability...' : 
                       isCreatingBooking ? 'Creating Booking...' : 
                       !checkIn || !checkOut ? 'Select dates' : 'Reserve Now'}
                    </Button>
                  </div>

                  {/* Validation Error Message */}
                  {validationError && (
                    <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-danger-600" />
                        <p className="text-sm text-danger-700 font-medium">{validationError}</p>
                      </div>
                    </div>
                  )}

                  {/* Booking Status */}
                  {(checkIn && checkOut) && (
                    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <p className="text-sm text-primary-700">
                          {billingNights} night{billingNights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-sm text-gray-600 mb-4">
                    You won't be charged yet
                  </p>

                  <Divider className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">${property.price} x {billingNights} nights</span>
                      <span className="font-medium text-gray-900">${basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cleaning fee</span>
                      <span className="font-medium text-gray-900">${cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Service fee</span>
                      <span className="font-medium text-gray-900">${serviceFee}</span>
                    </div>
                    <Divider className="my-3" />
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-bold text-gray-900">Total before taxes</span>
                      <span className="font-bold text-gray-900 text-lg">${totalAmount}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      
      {/* Booking Confirmation Dialog */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Confirm Your Reservation</h2>
                <p className="text-sm text-gray-600">Please review your booking details</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Property Info */}
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{`${property.location.city}, ${property.location.country}`}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{property.rating}</span>
                        <span className="text-sm text-gray-500">({property.review_count} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Check-in</p>
                        <p className="text-lg">{new Date(checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Check-out</p>
                        <p className="text-lg">{new Date(checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Guests</p>
                        <p className="text-lg">{guests} guest{guests > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Nights</p>
                        <p className="text-lg">{billingNights} night{billingNights > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {specialRequests && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Special Requests</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{specialRequests}</p>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${property.price} × {billingNights} nights</span>
                      <span>${basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>${cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${totalAmount}</span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                  onPress={handleConfirmBooking}
                  startContent={!isCreatingBooking && <CheckCircle className="w-4 h-4" />}
                  isLoading={isCreatingBooking}
                  disabled={isCreatingBooking}
                >
                  {isCreatingBooking ? 'Creating Booking...' : 'Confirm Reservation'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Success Dialog */}
      <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} size="md" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="text-center py-8">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your reservation has been successfully submitted. You'll receive a confirmation email shortly.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Booking Reference:</strong> NL{Date.now().toString().slice(-6)}</p>
                  <p><strong>Total Amount:</strong> ${totalAmount}</p>
                </div>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button color="primary" onPress={onClose} size="lg">
                  View My Bookings
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Error Dialog */}
      <Modal isOpen={isErrorOpen} onClose={onErrorClose} size="md" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="text-center py-8">
                <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-danger-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h2>
                <p className="text-gray-600 mb-6">
                  {errorMessage}
                </p>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => { onClose(); onConfirmOpen(); }}>
                  Try Again
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Loading Overlay */}
      {isCreatingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your reservation...</p>
          </div>
        </div>
      )}

      <ContactHostModal
        isOpen={isContactOpen}
        onClose={onContactClose}
        property={property}
        onSendMessage={handleContactMessage}
      />
    </div>
  )
}

export default PropertyDetailPage 