import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Chip, Divider, Pagination } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, MessageCircle, User, Home, Eye, DollarSign, X } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { MyBookingsPageProps, Booking, DatabaseBooking } from '../interfaces'
import { CancelBookingModal } from '../components/shared'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useBookingStore } from '../lib/stores/bookingStore'
import { BookingStatus } from '../interfaces/Booking'
import MyBookingCard from '../components/shared/MyBookingCard'

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
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('pending')
  const [selectedBooking, setSelectedBooking] = useState<GuestBookingWithProperties | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<GuestBookingWithProperties | null>(null)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusActions = (booking: GuestBookingWithProperties) => {
    switch (booking.status) {
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
      <MainLayout currentPage="bookings" onPageChange={onPageChange}>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
          {/* Banner Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-primary-100 text-lg">Manage your property bookings and travel history</p>
            </div>
          </div>

          {/* Tabs - use all statuses */}
          <div className="w-full">
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
        </div>

        {/* Loading/Error State */}
        {isLoadingGuestBookings ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <span className="text-lg text-gray-500">Loading bookings...</span>
          </div>
        ) : error ? (
          <div className="col-span-1  text-center py-12 text-red-600">
            {error}
          </div>
        ) : paginatedBookings.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mt-6 justify-center sm:justify-start">
            {paginatedBookings.map((booking) => (
              <MyBookingCard
                key={booking.id}
                booking={booking}
                onClick={handleBookingClick}
                getStatusColor={getStatusColor}
                getStatusActions={getStatusActions}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedTab} bookings
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'pending' && "You don't have any pending bookings at the moment."}
              {selectedTab === 'confirmed' && "You don't have any confirmed bookings at the moment."}
              {selectedTab === 'cancelled' && "You don't have any cancelled bookings."}
              {selectedTab === 'completed' && "You haven't completed any bookings yet."}
              {selectedTab === 'rejected' && "You don't have any rejected bookings."}
              {selectedTab === 'accepted-and-waiting-for-payment' && "You don't have any bookings awaiting payment."}
              {selectedTab === 'payment-failed' && "You don't have any bookings with failed payment."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {paginatedBookings.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={totalPages}
              page={page}
              onChange={handlePageChange}
            />
          </div>
        )}
      </MainLayout>

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
                <h2 className="text-xl font-bold">Booking Details</h2>
                {selectedBooking && (
                  <p className="text-sm text-gray-600">Booking ID: {selectedBooking.id}</p>
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
                              : 'Location not available'
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
                        <Avatar size="md" />
                        <div className="flex-1">
                          <p className="font-medium">Host</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Contact information not available</span>
                          </div>
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
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(selectedBooking.check_in_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{selectedBooking.guest_count} guest{selectedBooking.guest_count > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Booking Date</p>
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
                          <span>Accommodation</span>
                          <span>${(selectedBooking.total_amount - (selectedBooking.cleaning_fee || 0) - (selectedBooking.service_fee || 0) - (selectedBooking.taxes || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning fee</span>
                          <span>${selectedBooking.cleaning_fee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>${selectedBooking.service_fee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>${selectedBooking.taxes || 0}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${selectedBooking.total_amount}</span>
                        </div>
                        <div className="mt-2 text-gray-600">
                          <p>Payment method: Not available</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Special Requests */}
                    {selectedBooking.special_requests && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="font-semibold mb-3">Special Requests</h4>
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