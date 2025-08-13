import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Chip, Divider, Pagination } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, MessageCircle, User, Home, Eye, DollarSign, X, CheckCircle, AlertCircle } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { MyBookingsPageProps, Booking, DatabaseBooking } from '../interfaces'
import { CancelBookingModal } from '../components/shared'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useBookingStore } from '../lib/stores/bookingStore'
import { BookingStatus } from '../interfaces/Booking'
import MyBookingCard from '../components/shared/MyBookingCard'
import { useAuthStore } from '../lib/stores/authStore'
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

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onPageChange }) => {
  const { user } = useAuthStore()
  const { t } = useTranslation('booking')
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('pending')
  const [selectedBooking, setSelectedBooking] = useState<GuestBookingWithProperties | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<GuestBookingWithProperties | null>(null)
  const [bookingToPay, setBookingToPay] = useState<GuestBookingWithProperties | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure()
  const [paginationByStatus, setPaginationByStatus] = useState<Record<BookingStatus, { page: number }>>(() => {
    const initial: Record<BookingStatus, { page: number }> = {} as any
    ALL_STATUSES.forEach(status => { initial[status] = { page: 1 } })
    return initial
  })
  const { loadGuestBookings } = useBookingManagement()
  const { guestBookings, isLoadingGuestBookings, error } = useBookingStore()
  
  // Type cast since the query includes joined properties data
  const guestBookingsWithProperties = guestBookings as GuestBookingWithProperties[]

  useEffect(() => {
    loadGuestBookings().catch(console.error)
  }, [loadGuestBookings])

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
              startContent={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button size="sm" color="secondary" variant="flat">
              Message Host
            </Button>
          </div>
        )
      case 'completed':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="flat">
              Re-Book
            </Button>
            <Button size="sm" color="primary">
              Write Review
            </Button>
          </div>
        )
      case 'cancelled':
        return (
          <Button size="sm" variant="flat">
            Re-Book
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

  const handlePayNow = (booking: GuestBookingWithProperties) => {
    console.log('✅ FedaPay checkout completed for booking:', booking.id)
    // Refresh bookings to update status
    loadGuestBookings().catch(console.error)
  }

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('✅ Payment successful, closing modal and refreshing bookings', { transactionId })
    setBookingToPay(null)
    // Refresh bookings to show updated status
    loadGuestBookings().catch(console.error)
  }

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment failed:', error)
    // Keep modal open so user can retry
  }

  const handleConfirmCancel = (reason: string) => {
    console.log('Cancelling booking:', bookingToCancel?.id, 'Reason:', reason)
    setBookingToCancel(null)
    onCancelClose()
  }

  const stats: Record<BookingStatus, number> = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = guestBookingsWithProperties.filter(b => b.status === status).length
    return acc
  }, {} as Record<BookingStatus, number>)

  const totalSpent = guestBookingsWithProperties.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0)
  const avgRating = 0 // Rating not available in DatabaseBooking

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
      {/* Header Section - Full Width */}
      <div className="col-span-full mb-6">
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
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={handleTabChange}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600"
          }}
        >
          {ALL_STATUSES.map(status => (
            <Tab key={status} title={`${status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')} (${stats[status]})`} />
          ))}
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoadingGuestBookings ? (
        <div className="col-span-full text-center py-12">
          <span className="text-lg text-gray-500">{t('booking.messages.loading')}</span>
        </div>
      ) : error ? (
        <div className="col-span-full text-center py-12 text-red-600">
          {error}
        </div>
      ) : paginatedBookings.length > 0 ? (
        <>
          {/* Booking Cards */}
          {paginatedBookings.map((booking) => (
            <MyBookingCard
              key={booking.id}
              booking={booking}
              onClick={handleBookingClick}
              getStatusColor={getStatusColor}
              getStatusActions={getStatusActions}
              onPayNow={handlePayNow}
              onCancelBooking={handleCancelBooking}
            />
          ))}
          
          {/* Pagination - Full Width */}
          {totalPages > 1 && (
            <div className="col-span-full flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={page}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="col-span-full text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('booking.messages.noBookings', { status: selectedTab })}
          </h3>
          <p className="text-gray-500">
            {selectedTab === 'pending' && t('booking.messages.noPendingBookings')}
            {selectedTab === 'confirmed' && t('booking.messages.noConfirmedBookings')}
            {selectedTab === 'cancelled' && t('booking.messages.noCancelledBookings')}
            {selectedTab === 'completed' && t('booking.messages.noCompletedBookings')}
            {selectedTab === 'rejected' && t('booking.messages.noRejectedBookings')}
            {selectedTab === 'accepted-and-waiting-for-payment' && t('booking.messages.noAwaitingPaymentBookings')}
            {selectedTab === 'payment-failed' && t('booking.messages.noFailedPaymentBookings')}
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
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{selectedBooking.properties?.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {selectedBooking.properties?.location?.city && selectedBooking.properties?.location?.country 
                              ? `${selectedBooking.properties.location.city}, ${selectedBooking.properties.location.country}`
                              : t('booking.details.locationNotAvailable')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedBooking.properties?.rating}</span>
                        </div>
                        <Chip 
                          color={getStatusColor(selectedBooking.status)}
                          variant="solid"
                          size="sm"
                          className="text-white font-medium mt-2"
                        >
                          {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    {/* Host Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Host Information
                      </h4>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size="md" 
                          src={selectedBooking.hosts?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBooking.hosts?.display_name || 'Host')}`}
                          alt={selectedBooking.hosts?.display_name || 'Host'}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{selectedBooking.hosts?.display_name || t('booking.labels.host')}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {selectedBooking.hosts ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span>{selectedBooking.hosts.host_rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <span>{selectedBooking.hosts.total_host_reviews || 0} reviews</span>
                              </>
                            ) : (
                              <span>{t('booking.details.contactNotAvailable')}</span>
                            )}
                          </div>
                          {selectedBooking.hosts?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Mail className="w-3 h-3" />
                              <span>{selectedBooking.hosts.email}</span>
                            </div>
                          )}
                          {selectedBooking.hosts?.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedBooking.hosts.phone}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          startContent={<MessageCircle className="w-4 h-4" />}
                        >
                          Message
                        </Button>
                      </div>
                    </div>

                    <Divider />

                    {/* Booking Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Booking Information
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
                          <p className="text-gray-600">{t('booking.details.bookingDate')}</p>
                          <p className="font-medium">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Payment Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('booking.details.accommodation')}</span>
                          <span>${(selectedBooking.total_amount - (selectedBooking.cleaning_fee || 0) - (selectedBooking.service_fee || 0) - (selectedBooking.taxes || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.cleaningFee')}</span>
                          <span>${selectedBooking.cleaning_fee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.serviceFee')}</span>
                          <span>${selectedBooking.service_fee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.details.taxes')}</span>
                          <span>${selectedBooking.taxes || 0}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between font-semibold">
                          <span>{t('booking.details.total')}</span>
                          <span>${selectedBooking.total_amount}</span>
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
                          <h4 className="font-semibold mb-3">{t('booking.details.specialRequests')}</h4>
                          <p className="text-sm text-gray-600">{selectedBooking.special_requests}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
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

      {/* Cancel Booking Modal - Comment out for now since it expects old Booking interface */}
      {/* {bookingToCancel && (
        <CancelBookingModal
          isOpen={isCancelOpen}
          onClose={onCancelClose}
          booking={bookingToCancel}
          onConfirmCancel={handleConfirmCancel}
        />
      )} */}
    </>
  )
}

export default MyBookingsPage 