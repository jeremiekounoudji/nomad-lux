import React, { useState, useEffect, useMemo } from 'react'
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
  X
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
import { usePropertySettings } from '../hooks/usePropertySettings'
import { useBookingFlow } from '../hooks/useBookingFlow'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { calculateBookingPrice } from '../utils/priceCalculation'
import toast from 'react-hot-toast'

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ property, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [checkInTime, setCheckInTime] = useState('15:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isLiked, setIsLiked] = useState(property.is_liked)

  // Modal states
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure()
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onClose: onErrorClose } = useDisclosure()

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  // Load property settings on component mount
  useEffect(() => {
    if (property.id) {
      console.log('🔄 Loading property settings for property:', property.id)
      getPropertySettings(property.id)
        .then(settings => {
          console.log('✅ Property settings loaded:', settings)
          setPropertySettings(settings)
        })
        .catch(error => {
          console.warn('⚠️ Failed to load property settings:', error)
        })
    }
  }, [property.id, getPropertySettings])

  // Calculate price using the new price calculation utility
  const priceCalculation = useMemo(() => {
    if (!checkIn || !checkOut || !property.price) {
      return {
        billingNights: 1,
        basePrice: property.price || 0,
        cleaningFee: property.cleaning_fee || 0,
        serviceFee: property.service_fee || 0,
        totalAmount: (property.price || 0) + (property.cleaning_fee || 0) + (property.service_fee || 0)
      }
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
  }, [checkIn, checkOut, checkInTime, checkOutTime, guests, property])

  const { billingNights, basePrice, cleaningFee, serviceFee, totalAmount } = priceCalculation

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
            <button 
              onClick={onShareOpen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-xl">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>

                {/* Quick View Button */}
                <button 
                  onClick={() => {}} // You can implement quick view here
                  className="absolute bottom-4 left-4 bg-white hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View all photos
                </button>
              </div>

              {/* Thumbnail Strip - Mobile Optimized */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {property.images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {property.images.length > 6 && (
                  <button className="flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all">
                    +{property.images.length - 6}
                  </button>
                )}
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
            <Card className="mb-8 shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-gray-900">What this place offers</h3>
              </CardHeader>
              <CardBody className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100">
                      <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center">
                        {amenity === 'WiFi' && <Wifi className="w-5 h-5 text-white" />}
                        {amenity === 'Parking' && <Car className="w-5 h-5 text-white" />}
                        {amenity === 'Kitchen' && <Utensils className="w-5 h-5 text-white" />}
                        {amenity === 'Pool' && <Waves className="w-5 h-5 text-white" />}
                        {amenity === 'Beach Access' && <Waves className="w-5 h-5 text-white" />}
                        {!['WiFi', 'Parking', 'Kitchen', 'Pool', 'Beach Access'].includes(amenity) && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">{amenity}</span>
                        {amenity === 'WiFi' && <p className="text-sm text-gray-600">High-speed internet</p>}
                        {amenity === 'Pool' && <p className="text-sm text-gray-600">Infinity pool with ocean view</p>}
                        {amenity === 'Kitchen' && <p className="text-sm text-gray-600">Fully equipped kitchen</p>}
                        {amenity === 'Parking' && <p className="text-sm text-gray-600">Free on-site parking</p>}
                        {amenity === 'Beach Access' && <p className="text-sm text-gray-600">Private beach access</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Host Info */}
            <Card className="mb-8 shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-gray-900">Meet your host</h3>
              </CardHeader>
              <CardBody className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Host Profile */}
                  <div className="flex items-center sm:flex-col sm:items-center gap-4 sm:text-center">
                    <Avatar
                      src={property.host?.avatar_url || '/default-avatar.png'}
                      alt={property.host?.display_name || 'Host'}
                      className="w-20 h-20 sm:w-24 sm:h-24"
                      isBordered
                      color="primary"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{property.host?.display_name || 'Your Host'}</h4>
                      <p className="text-sm text-gray-600">Host since 2019</p>
                      {property.host?.is_email_verified && (
                        <Chip size="sm" color="primary" className="mt-2">
                          Verified Host
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Host Details */}
                  <div className="flex-1">
                    {/* Host Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">4.9</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <MessageCircle className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">127</div>
                        <div className="text-xs text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">100%</div>
                        <div className="text-xs text-gray-600">Response</div>
                      </div>
                    </div>

                    {/* Host Bio */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {property.host?.bio || "I'm a passionate host who loves sharing beautiful spaces with travelers from around the world. I've been hosting for over 5 years and take pride in providing exceptional experiences for my guests."}
                    </p>

                    {/* Host Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Chip size="sm" color="success" startContent={<Award className="w-3 h-3" />}>
                        Superhost
                      </Chip>
                      <Chip size="sm" color="primary" startContent={<Shield className="w-3 h-3" />}>
                        Identity verified
                      </Chip>
                      <Chip size="sm" color="secondary" startContent={<MessageCircle className="w-3 h-3" />}>
                        Quick responder
                      </Chip>
                    </div>

                    {/* Contact Button */}
                    <Button 
                      color="primary" 
                      variant="solid" 
                      size="lg"
                      startContent={<MessageCircle className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                      onPress={onContactOpen}
                    >
                      Contact Host
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Location */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-gray-900">Where you'll be</h3>
              </CardHeader>
              <CardBody className="pt-6">
                <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg">
                      {`${property.location.city}, ${property.location.country}`}
                    </p>
                    <p className="text-gray-600 mt-2">Interactive map coming soon</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
                        setCheckIn(checkInDate)
                        setCheckOut(checkOutDate)
                        setValidationError('')
                      }}
                      onTimeChange={(checkInTimeNew, checkOutTimeNew) => {
                        setCheckInTime(checkInTimeNew)
                        setCheckOutTime(checkOutTimeNew)
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
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
                      />
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-OUT TIME</label>
                      <input
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="border-2 border-gray-200 rounded-lg p-3 mb-4 hover:border-gray-300 transition-all focus-within:border-primary-500">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GUESTS</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
                    >
                      {Array.from({ length: property.max_guests }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
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

                  {/* Reserve Button - Make it more prominent */}
                  <div className="mb-4">
                    <Button 
                      color="primary" 
                      size="lg" 
                      className="w-full font-bold text-lg py-4 bg-primary-600 hover:bg-primary-700"
                      radius="lg"
                      onPress={handleReserveClick}
                      startContent={<Calendar className="w-5 h-5" />}
                      isLoading={isCheckingAvailability}
                      disabled={isCheckingAvailability}
                    >
                      {isCheckingAvailability ? 'Checking Availability...' : 'Reserve Now'}
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

      <SharePropertyModal
        isOpen={isShareOpen}
        onClose={onShareClose}
        property={property}
      />

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