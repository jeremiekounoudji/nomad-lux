import React, { useState, useEffect } from 'react'
import { Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Chip, Divider } from '@heroui/react'
import { Calendar, MapPin, Star, CreditCard, Phone, Mail, MessageCircle, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { MyBookingsPageProps, DatabaseBooking } from '../interfaces'
import { CancelBookingModal, ContactHostModal } from '../components/shared'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useBookingStore } from '../lib/stores/bookingStore'
import { BookingStatus } from '../interfaces/Booking'
import { formatPrice } from '../utils/currencyUtils'
import MyBookingCard from '../components/shared/MyBookingCard'
// import { useAuthStore } from '../lib/stores/authStore' // Commented out to avoid unused import warning
import { useTranslation } from '../lib/stores/translationStore'

// Extended type for guest bookings with joined properties data
type GuestBookingWithProperties = DatabaseBooking & {
  properties?: {
    title: string
    images: string[]
    location: {
      city: string
      country: string
      address?: string
      coordinates: {
        lat: number
        lng: number
      }
    }
    rating: number
  }
  hosts?: {
    id: string
    display_name: string
    avatar_url?: string
    email: string
    phone?: string
    host_rating?: number
    total_host_reviews: number
  }
}

const ITEMS_PER_PAGE = 6
const ALL_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rejected',
  'accepted-and-waiting-for-payment',
  'payment-failed',
]

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onPageChange: _onPageChange }) => {
  // const { user } = useAuthStore() // Commented out to avoid unused variable warning
  const { t } = useTranslation(['booking', 'common'])
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('pending')
  const [selectedBooking, setSelectedBooking] = useState<GuestBookingWithProperties | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<GuestBookingWithProperties | null>(null)
  const [bookingToContact, setBookingToContact] = useState<GuestBookingWithProperties | null>(null)
  // const [bookingToPay, setBookingToPay] = useState<GuestBookingWithProperties | null>(null) // Commented out to avoid unused variable warning
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure()
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure()
  const [paginationByStatus, setPaginationByStatus] = useState<Record<BookingStatus, { page: number }>>(() => {
    const initial: Record<BookingStatus, { page: number }> = {} as any
    ALL_STATUSES.forEach(status => { initial[status] = { page: 1 } })
    return initial
  })
  const { loadGuestBookings, cancelBooking } = useBookingManagement()
  const { guestBookings, isLoadingGuestBookings, error } = useBookingStore()
  
  // Type cast since the query includes joined properties data
  const guestBookingsWithProperties = guestBookings as GuestBookingWithProperties[]

  useEffect(() => {
    loadGuestBookings().catch(console.error)
  }, [loadGuestBookings])

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const filteredBookings = guestBookingsWithProperties.filter(booking => booking.status === selectedTab)
  const page = paginationByStatus[selectedTab]?.page || 1
  const pageSize = ITEMS_PER_PAGE
  const totalPages = Math.ceil(filteredBookings.length / pageSize)
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize)

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (status) {
      case 'accepted-and-waiting-for-payment':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'completed':
        return 'primary'
      case 'cancelled':
      case 'rejected':
        return 'danger'
      case 'payment-failed':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusActions = (booking: GuestBookingWithProperties) => {
    switch (booking.status) {
      case 'accepted-and-waiting-for-payment':
        return null // handled inside card with full-width buttons
      case 'confirmed':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="flat" 
              color="danger"
              onPress={() => handleCancelBooking(booking)}
              startContent={<X className="size-4" />}
            >
              {t('booking.actions.cancelBooking')}
            </Button>
            <Button 
              size="sm" 
              color="secondary" 
              variant="flat"
              onPress={() => handleContactHost(booking)}
            >
              {t('booking.actions.contactHost')}
            </Button>
          </div>
        )
      case 'completed':
        return (
                  <div className="flex gap-2">
          <Button size="sm" variant="flat">
            {t('booking.actions.rebook')}
          </Button>
          <Button size="sm" color="primary">
            {t('booking.actions.leaveReview')}
          </Button>
        </div>
        )
      case 'cancelled':
        return (
                  <Button size="sm" variant="flat">
          {t('booking.actions.rebook')}
        </Button>
        )
      default:
        return null
    }
  }

  const handleBookingClick = (booking: GuestBookingWithProperties) => {
    setSelectedBooking(booking)
    onOpen()
  }

  const handleCancelBooking = (booking: GuestBookingWithProperties) => {
    setBookingToCancel(booking)
    onCancelOpen()
  }

  const handleContactHost = (booking: GuestBookingWithProperties) => {
    setBookingToContact(booking)
    onContactOpen()
  }

  const handlePayNow = (booking: GuestBookingWithProperties) => {
    console.log('✅ FedaPay checkout completed for booking:', booking.id)
    // Refresh bookings to update status
    loadGuestBookings().catch(console.error)
  }

  // const handlePaymentSuccess = (transactionId: string) => { // Commented out to avoid unused variable warning
  //   console.log('✅ Payment successful, closing modal and refreshing bookings', { transactionId })
  //   setBookingToPay(null)
  //   // Refresh bookings to show updated status
  //   loadGuestBookings().catch(console.error)
  // }

  // const handlePaymentError = (error: string) => { // Commented out to avoid unused variable warning
  //   console.error('❌ Payment failed:', error)
  //   // Keep modal open so user can retry
  // }

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel) return
    
    try {
      console.log('🔄 Cancelling booking:', bookingToCancel.id, 'Reason:', reason)
      
      // Call the cancel booking method (this will handle refund processing)
      await cancelBooking(bookingToCancel.id, reason, false)
      
      // Refresh bookings to show updated status
      await loadGuestBookings()
      
      // Close modal and clear state
    setBookingToCancel(null)
    onCancelClose()

      toast.success(t('booking.messages.bookingCancelled'))
      
      console.log('✅ Booking cancelled and refund request created successfully')
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error)
      // Keep modal open so user can retry
    }
  }

  const handleContactHostClose = () => {
    setBookingToContact(null)
    onContactClose()
  }

  const stats: Record<BookingStatus, number> = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = guestBookingsWithProperties.filter(b => b.status === status).length
    return acc
  }, {} as Record<BookingStatus, number>)

  // const totalSpent = guestBookingsWithProperties.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0) // Commented out to avoid unused variable warning
  // const avgRating = 0 // Rating not available in DatabaseBooking // Commented out to avoid unused variable warning

  const handleTabChange = (key: string | number) => {
    setSelectedTab(key as BookingStatus)
    setPaginationByStatus(prev => {
      const status = key as BookingStatus
      if (prev[status]) return prev
      return { ...prev, [status]: { page: 1 } }
    })
  }

  const handlePageChange = (page: number) => {
    setPaginationByStatus(prev => ({
      ...prev,
      [selectedTab]: { page }
    }))
  }

  return (
    <>
      <div className="col-span-1 space-y-6 p-2 md:col-span-2 lg:col-span-4">
        {/* Banner Header */}
        <PageBanner
          backgroundImage={getBannerConfig('myBookings').image}
          title={t('booking.myBookings.banner.title')}
          subtitle={t('booking.myBookings.banner.subtitle')}
          imageAlt={t('common.pageBanner.myBookings')}
          overlayOpacity={getBannerConfig('myBookings').overlayOpacity}
          height={getBannerConfig('myBookings').height}
          className="mb-8"
        />

        {/* Tabs */}
        <div className="w-full">
          <div className="scrollbar-none -mx-5 overflow-x-auto px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={handleTabChange}
              variant="underlined"
              classNames={{
                tabList: "gap-2 sm:gap-4 md:gap-6 w-max relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary-500",
                tab: "max-w-fit px-2 sm:px-3 md:px-4 h-12 flex-shrink-0",
                tabContent: "group-data-[selected=true]:text-primary-600 text-xs sm:text-sm md:text-base whitespace-nowrap"
              }}
            >
              {ALL_STATUSES.map(status => (
                <Tab key={status} title={`${t(`booking.status.${status}`)} (${stats[status]})`} />
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingGuestBookings && (
        <div className="col-span-1 py-12 text-center md:col-span-2 lg:col-span-4">
          <span className="text-lg text-gray-500">{t('booking.messages.loading')}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="col-span-1 py-12 text-center md:col-span-2 lg:col-span-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="mb-2 text-lg font-medium text-red-800">{t('booking.errors.loadingBookings')}</h3>
            <Button color="primary" onPress={() => loadGuestBookings()}>
              {t('booking.errors.tryAgain')}
            </Button>
          </div>
        </div>
      )}

      {/* Bookings Grid */}
      {!isLoadingGuestBookings && !error && paginatedBookings.length > 0 && (
        <>
          {/* Bookings Container */}
          <div className="col-span-1 p-2 md:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {paginatedBookings.map((booking) => (
                <div key={booking.id} className="w-full">
                  <MyBookingCard
                    booking={booking}
                    onClick={handleBookingClick}
                    getStatusColor={getStatusColor}
                    getStatusActions={getStatusActions}
                    onPayNow={handlePayNow}
                    onCancelBooking={handleCancelBooking}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="col-span-1 mt-6 flex items-center justify-between border-t border-gray-100 pt-4 md:col-span-2 lg:col-span-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isLoadingGuestBookings}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                  ${page === 1 || isLoadingGuestBookings
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {t('booking.pagination.previous', { defaultValue: 'Previous' })}
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {t('booking.pagination.pageOf', { defaultValue: 'Page {{current}} of {{total}}', current: page, total: totalPages })}
                </span>
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={isLoadingGuestBookings || page >= totalPages}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                  ${isLoadingGuestBookings || page >= totalPages
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {t('booking.pagination.next', { defaultValue: 'Next' })}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Empty State */}
      {!isLoadingGuestBookings && !error && paginatedBookings.length === 0 && (
        <div className="col-span-1 py-12 text-center md:col-span-2 lg:col-span-4">
          <Calendar className="mx-auto mb-4 size-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {(() => {
              const message = t('booking.messages.noBookings', { status: t(`booking.status.${selectedTab}`) })
              console.log('🌐 MyBookingsPage: noBookings message:', message, 'for status:', selectedTab)
              return message
            })()}
          </h3>
          <p className="text-gray-500">
            {(() => {
              let message = ''
              if (selectedTab === 'pending') message = t('booking.messages.noPendingBookings')
              else if (selectedTab === 'confirmed') message = t('booking.messages.noConfirmedBookings')
              else if (selectedTab === 'cancelled') message = t('booking.messages.noCancelledBookings')
              else if (selectedTab === 'completed') message = t('booking.messages.noCompletedBookings')
              else if (selectedTab === 'rejected') message = t('booking.messages.noRejectedBookings')
              else if (selectedTab === 'accepted-and-waiting-for-payment') message = t('booking.messages.noAwaitingPaymentBookings')
              else if (selectedTab === 'payment-failed') message = t('booking.messages.noFailedPaymentBookings')
              
              console.log('🌐 MyBookingsPage: specific message:', message, 'for status:', selectedTab)
              return message
            })()}
          </p>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">{t('booking.details.title')}</h2>
                {selectedBooking && (
                  <p className="text-sm text-gray-600">{t('booking.details.bookingId', { id: selectedBooking.id })}</p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedBooking && (
                  <div className="space-y-6">
                    {/* Property Info */}
                    <div className="flex gap-4">
                      <img
                        src={selectedBooking.properties?.images?.[0] || ''}
                        alt={selectedBooking.properties?.title || ''}
                        className="size-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{selectedBooking.properties?.title}</h3>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="size-4" />
                          <span>
                            {selectedBooking.properties?.location?.city && selectedBooking.properties?.location?.country 
                              ? `${selectedBooking.properties.location.city}, ${selectedBooking.properties.location.country}`
                              : t('booking.details.locationNotAvailable')
                            }
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="size-4 fill-current text-yellow-500" />
                          <span className="text-sm font-medium">{selectedBooking.properties?.rating}</span>
                        </div>
                        <Chip 
                          color={getStatusColor(selectedBooking.status)}
                          variant="solid"
                          size="sm"
                          className="mt-2 font-medium text-white"
                        >
                          {t(`booking.status.${selectedBooking.status}`)}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    {/* Host Information */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <User className="size-5" />
                        {t('booking.details.hostInformation')}
                      </h4>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size="md" 
                          src={selectedBooking.hosts?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBooking.hosts?.display_name || 'Host')}`}
                          alt={selectedBooking.hosts?.display_name || 'Host'}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{selectedBooking.hosts?.display_name || t('booking.labels.host')}</p>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                            {selectedBooking.hosts ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <Star className="size-3 fill-current text-yellow-500" />
                                  <span>{selectedBooking.hosts.host_rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <span>{selectedBooking.hosts.total_host_reviews || 0} reviews</span>
                              </>
                            ) : (
                              <span>{t('booking.details.contactNotAvailable')}</span>
                            )}
                          </div>
                          {selectedBooking.hosts?.email && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="size-3" />
                              <span>{selectedBooking.hosts.email}</span>
                            </div>
                          )}
                          {selectedBooking.hosts?.phone && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="size-3" />
                              <span>{selectedBooking.hosts.phone}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          startContent={<MessageCircle className="size-4" />}
                            onPress={() => handleContactHost(selectedBooking)}
                        >
                          {t('booking.actions.contactHost')}
                        </Button>
                      </div>
                    </div>

                    <Divider />

                    {/* Booking Information */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <Calendar className="size-5" />
                        {t('booking.details.bookingInformation')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{t('booking.details.checkIn')}</p>
                          <p className="font-medium">{new Date(selectedBooking.check_in_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{t('booking.details.checkOut')}</p>
                          <p className="font-medium">{new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                                                <p className="text-gray-600">{t('booking.details.guests')}</p>
                      <p className="font-medium">{selectedBooking.guest_count} {selectedBooking.guest_count > 1 ? t('booking.details.guestsPlural') : t('booking.details.guest')}</p>
                        </div>
                        <div>
                          <span>{t('booking.details.bookingDate')}</span>
                          <p className="font-medium">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Payment Information */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <CreditCard className="size-5" />
                        {t('booking.details.paymentInformation')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('booking.details.accommodation')}</span>
                          <span>{formatPrice((selectedBooking.total_amount - (selectedBooking.cleaning_fee || 0) - (selectedBooking.service_fee || 0) - (selectedBooking.taxes || 0)), selectedBooking.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.cleaningFee')}</span>
                          <span>{formatPrice(selectedBooking.cleaning_fee || 0, selectedBooking.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.serviceFee')}</span>
                          <span>{formatPrice(selectedBooking.service_fee || 0, selectedBooking.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.taxes')}</span>
                          <span>{formatPrice(selectedBooking.taxes || 0, selectedBooking.currency || 'USD')}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between font-semibold">
                          <span>{t('booking.details.total')}</span>
                          <span>{formatPrice(selectedBooking.total_amount, selectedBooking.currency || 'USD')}</span>
                        </div>
                        <div className="mt-2 text-gray-600">
                          <p>{t('booking.details.paymentMethod')}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Special Requests */}
                    {selectedBooking.special_requests && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="mb-3 font-semibold">{t('booking.details.specialRequests')}</h4>
                          <p className="text-sm text-gray-600">{selectedBooking.special_requests}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t('common.buttons.close')}
                </Button>
                {selectedBooking && (
                  <div className="flex gap-2">
                    {getStatusActions(selectedBooking)}
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={isCancelOpen}
          onClose={onCancelClose}
            booking={{
              id: bookingToCancel.id,
              propertyName: bookingToCancel.properties?.title || '',
              propertyImage: bookingToCancel.properties?.images?.[0] || '',
              location: bookingToCancel.properties?.location?.city && bookingToCancel.properties?.location?.country 
                ? `${bookingToCancel.properties.location.city}, ${bookingToCancel.properties.location.country}`
                : '',
              checkIn: bookingToCancel.check_in_date,
              checkOut: bookingToCancel.check_out_date,
              guests: bookingToCancel.guest_count,
              totalPrice: bookingToCancel.total_amount,
              currency: bookingToCancel.currency || 'USD',
              status: bookingToCancel.status
            }}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {/* Contact Host Modal */}
      {bookingToContact && (
        <ContactHostModal
          isOpen={isContactOpen}
          onClose={handleContactHostClose}
          property={{
            id: bookingToContact.property_id,
            title: bookingToContact.properties?.title || '',
            images: bookingToContact.properties?.images || [],
            location: bookingToContact.properties?.location || { city: '', country: '', coordinates: { lat: 0, lng: 0 } },
            host: {
              id: bookingToContact.hosts?.id || '',
              display_name: bookingToContact.hosts?.display_name || '',
              avatar_url: bookingToContact.hosts?.avatar_url || '',
              email: bookingToContact.hosts?.email || '',
              phone: bookingToContact.hosts?.phone || ''
            }
          }}
        />
      )}
    </>
  )
}

export default MyBookingsPage 