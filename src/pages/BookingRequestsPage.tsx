import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Avatar, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider, Tabs, Tab, Spinner, Pagination } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, MessageCircle, User, Home, Eye, DollarSign, Check, X, ClipboardList } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { BookingRequestsPageProps, BookingRequest, BookingStatus, PaginationParams } from '../interfaces'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const ALL_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rejected',
  'accepted-and-waiting-for-payment',
  'payment-failed',
]

// Helper function to get status color
const getStatusColor = (status: BookingStatus | 'no_shows') => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'success'
    case 'cancelled':
    case 'rejected':
      return 'danger'
    case 'completed':
      return 'primary'
    case 'accepted-and-waiting-for-payment':
      return 'secondary'
    case 'payment-failed':
      return 'danger'
    case 'no_shows':
      return 'danger'
    default:
      return 'default'
  }
}

const BookingRequestsPage: React.FC<BookingRequestsPageProps> = ({ onPageChange }) => {
  const [selectedTab, setSelectedTab] = useState<BookingStatus>('pending')
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [paginationParamsByStatus, setPaginationParamsByStatus] = useState<Record<BookingStatus, PaginationParams>>(() => {
    const initial: Record<BookingStatus, PaginationParams> = {} as any
    ALL_STATUSES.forEach(status => {
      initial[status] = {
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    sortBy: 'created_at',
        sortOrder: 'desc',
      }
    })
    return initial
  })
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Hooks
  const { user } = useAuthStore()
  const {
    loadHostBookingRequestsByStatus,
    loadBookingRequestsCounts,
    approveBooking,
    declineBooking
  } = useBookingManagement()

  // Get data from store
  const { 
    bookingRequestsByStatus,
    paginationData,
    isLoadingHostRequests, 
    isUpdatingBooking,
    error 
  } = useBookingStore()

  // Request counts state
  const [requestCounts, setRequestCounts] = useState<Record<BookingStatus | 'no_shows', number>>({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    'accepted-and-waiting-for-payment': 0,
    completed: 0,
    rejected: 0,
    'payment-failed': 0,
    'no_shows': 0
  })

  // Per-request loading state
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)
  const [updatingAction, setUpdatingAction] = useState<'approve' | 'decline' | null>(null)

  // Load booking requests and counts on component mount and tab/page change
  useEffect(() => {
    if (user?.id) {
      const paginationParams = paginationParamsByStatus[selectedTab]
      // Load requests for current tab with pagination
      loadHostBookingRequestsByStatus(
        selectedTab,
        paginationParams,
        user.id
      ).catch(console.error)

      // Load counts for all statuses
      loadBookingRequestsCounts(user.id)
        .then(counts => {
          setRequestCounts({
            ...counts,
            'no_shows': 0 // Default to 0 since it's not in the DB
          })
        })
        .catch(error => {
          console.error('❌ Error loading booking counts:', error)
          toast.error('Failed to load booking counts')
          setRequestCounts({
            pending: 0,
            confirmed: 0,
            cancelled: 0,
            completed: 0,
            rejected: 0,
            'accepted-and-waiting-for-payment': 0,
            'payment-failed': 0,
            'no_shows': 0
          })
        })
    }
  }, [user?.id, selectedTab, paginationParamsByStatus[selectedTab].page])

  // Handle tab switch: restore last page for that status (default to 1)
  const handleTabChange = (key: string | number) => {
    setSelectedTab(key as BookingStatus)
    setPaginationParamsByStatus(prev => {
      const status = key as BookingStatus
      // If already has params, keep; else, set to page 1
      if (prev[status]) return prev
      return {
        ...prev,
        [status]: {
          page: 1,
          pageSize: ITEMS_PER_PAGE,
          sortBy: 'created_at',
          sortOrder: 'desc',
        }
      }
    })
  }

  // Handle page change for current tab only
  const handlePageChange = (page: number) => {
    setPaginationParamsByStatus(prev => ({
      ...prev,
      [selectedTab]: {
        ...prev[selectedTab],
        page
      }
    }))
  }

  const handleRequestClick = (request: BookingRequest) => {
    setSelectedRequest(request)
    onOpen()
  }

  const handleApprove = async (requestId: string) => {
    setUpdatingBookingId(requestId)
    setUpdatingAction('approve')
    try {
      console.log('🔄 Approving booking:', requestId)
      await approveBooking(requestId)
      toast.success('Booking approved successfully!')
      
      // Reload current page data
      if (user?.id) {
        loadHostBookingRequestsByStatus(selectedTab, paginationParamsByStatus[selectedTab], user.id)
        loadBookingRequestsCounts(user.id).then(counts => setRequestCounts(counts))
      }
    } catch (error) {
      console.error('❌ Error approving booking:', error)
      toast.error('Failed to approve booking')
    } finally {
      setUpdatingBookingId(null)
      setUpdatingAction(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting the booking')
      return
    }

    setUpdatingBookingId(requestId)
    setUpdatingAction('decline')
    try {
      console.log('🔄 Declining booking:', requestId)
      await declineBooking(requestId, rejectReason)
      toast.success('Booking declined')
      
      // Reload current page data
      if (user?.id) {
        loadHostBookingRequestsByStatus(selectedTab, paginationParamsByStatus[selectedTab], user.id)
        loadBookingRequestsCounts(user.id).then(counts => setRequestCounts(counts))
      }
      onClose() // Close the modal after successful decline
      setRejectReason('') // Reset the reason
    } catch (error) {
      console.error('❌ Error declining booking:', error)
      toast.error('Failed to decline booking')
    } finally {
      setUpdatingBookingId(null)
      setUpdatingAction(null)
    }
  }

  const currentRequests = bookingRequestsByStatus[selectedTab] || []
  const currentPagination = paginationData[selectedTab]

  // Remove incorrect requests initialization and use currentRequests directly
  const requests = currentRequests;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
            <p className="text-primary-100 text-lg">Manage and respond to guest booking requests</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          selectedKey={selectedTab}
          onSelectionChange={handleTabChange}
          className="mb-6"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600"
          }}
        >
          <Tab 
            key="pending" 
            title={`Pending (${requestCounts.pending})`}
          />
          <Tab 
            key="confirmed" 
            title={`Confirmed (${requestCounts.confirmed})`}
          />
          <Tab 
            key="cancelled" 
            title={`Cancelled (${requestCounts.cancelled})`}
          />
          <Tab 
            key="completed" 
            title={`Completed (${requestCounts.completed})`}
          />
          <Tab 
            key="rejected" 
            title={`Rejected (${requestCounts.rejected})`}
          />
          <Tab 
            key="accepted-and-waiting-for-payment" 
            title={`Awaiting Payment (${requestCounts['accepted-and-waiting-for-payment']})`}
          />
          <Tab 
            key="payment-failed" 
            title={`Payment Failed (${requestCounts['payment-failed']})`}
          />
        </Tabs>

        {/* Loading State */}
        {isLoadingHostRequests ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((n) => (
              <LoadingSkeleton key={n} />
            ))}
          </div>
        ) : (
          <>
            {/* Inline Error Display */}
            {error && (
              <div className="mb-4 text-red-600 text-center font-medium">
                {error}
              </div>
            )}
            {/* Requests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8">
                    <div className="text-gray-500 mb-2">No requests found</div>
                    <p className="text-sm text-gray-400">
                      {selectedTab === 'pending' 
                        ? 'You have no pending booking requests'
                        : `You have no ${selectedTab} bookings`}
                    </p>
                  </CardBody>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden flex flex-col">
                    <CardBody className="p-4 flex flex-col gap-4">
                      {/* Property Image - full width, top */}
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
                          <img
                            src={request.property_images[0]}
                            alt={request.property_title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <h4 className="text-white text-sm font-medium line-clamp-1">
                              {request.property_title}
                            </h4>
                          </div>
                        </div>

                          {/* Guest Info */}
                      <div className="flex items-center gap-3 mb-2">
                            <Avatar
                              src={request.guest_avatar_url}
                              name={request.guest_display_name}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.guest_display_name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>{request.guest_rating} ({request.total_guest_reviews} reviews)</span>
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                      <div className="grid grid-cols-1 gap-2 text-sm mb-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(request.check_in_date).toLocaleDateString()} - {new Date(request.check_out_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{request.guest_count} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {request.check_in_time} - {request.check_out_time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <CreditCard className="w-4 h-4" />
                              <span>${request.total_amount} total</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 mb-2">
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              startContent={<Mail className="w-4 h-4" />}
                              onClick={() => window.location.href = `mailto:${request.guest_email}`}
                            >
                              {request.guest_email}
                            </Button>
                            {request.guest_phone && (
                              <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                startContent={<Phone className="w-4 h-4" />}
                                onClick={() => window.location.href = `tel:${request.guest_phone}`}
                              >
                                {request.guest_phone}
                              </Button>
                            )}
                          </div>

                          {/* Special Requests */}
                          {request.special_requests && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Special Requests: </span>
                                {request.special_requests}
                              </p>
                            </div>
                          )}

                          {/* Status Badge */}
                      <div className="mb-2">
                            <Chip
                              color={getStatusColor(request.status as BookingStatus | 'no_shows')}
                              variant="flat"
                              size="sm"
                            >
                              {request.status}
                            </Chip>
                          </div>

                          {/* Actions */}
                          {request.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<X className="w-4 h-4" />}
                                onPress={() => {
                                  setSelectedRequest(request)
                                  onOpen()
                                }}
                                className="flex-1"
                            isLoading={updatingBookingId === request.id && updatingAction === 'decline'}
                            disabled={updatingBookingId === request.id}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                color="success"
                                startContent={<Check className="w-4 h-4" />}
                                onPress={() => handleApprove(request.id)}
                                className="flex-1"
                            isLoading={updatingBookingId === request.id && updatingAction === 'approve'}
                            disabled={updatingBookingId === request.id}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<Eye className="w-4 h-4" />}
                                onPress={() => handleRequestClick(request)}
                            disabled={updatingBookingId === request.id}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                    </CardBody>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {currentPagination && currentRequests.length > 0 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={currentPagination.totalPages}
                  page={currentPagination.currentPage}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Booking Request Details</h2>
                <p className="text-sm text-gray-600">Review all information about this booking request</p>
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-6">
                    {/* Property Details */}
                    <div>
                      <h4 className="font-semibold mb-3">Property Information</h4>
                      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={selectedRequest.property_images[0]}
                          alt={selectedRequest.property_title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{selectedRequest.property_title}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>Location details here</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Home className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">Property type details</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div>
                      <h4 className="font-semibold mb-3">Guest Information</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar
                            src={selectedRequest.guest_avatar_url}
                            name={selectedRequest.guest_display_name}
                            size="lg"
                          />
                          <div>
                            <p className="font-medium text-lg">
                              {selectedRequest.guest_display_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>
                                {selectedRequest.guest_rating} ({selectedRequest.total_guest_reviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            startContent={<Mail className="w-4 h-4" />}
                            className="justify-start"
                          >
                            {selectedRequest.guest_email}
                          </Button>
                          {selectedRequest.guest_phone && (
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              startContent={<Phone className="w-4 h-4" />}
                              className="justify-start"
                            >
                              {selectedRequest.guest_phone}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h4 className="font-semibold mb-3">Booking Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">Check-in</p>
                                <p className="text-gray-600">
                                  {new Date(selectedRequest.check_in_date).toLocaleDateString()}
                                  <span className="ml-2">{selectedRequest.check_in_time}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">Check-out</p>
                                <p className="text-gray-600">
                                  {new Date(selectedRequest.check_out_date).toLocaleDateString()}
                                  <span className="ml-2">{selectedRequest.check_out_time}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">Guests</p>
                                <p className="text-gray-600">{selectedRequest.guest_count} guests</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">Total Amount</p>
                                <p className="text-gray-600">${selectedRequest.total_amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">Payment Status</p>
                                <p className="text-gray-600">Pending payment</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedRequest.special_requests && (
                      <div>
                        <h4 className="font-semibold mb-3">Special Requests</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">{selectedRequest.special_requests}</p>
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Request Timeline
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-sm">Request Created</p>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedRequest.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {/* Add more timeline events based on booking status changes */}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                {selectedRequest && selectedRequest.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<X className="w-4 h-4" />}
                      onPress={() => {
                        handleDecline(selectedRequest.id)
                        onClose()
                      }}
                      isLoading={updatingBookingId === selectedRequest.id && updatingAction === 'decline'}
                      disabled={updatingBookingId === selectedRequest.id}
                    >
                      Decline
                    </Button>
                    <Button
                      color="success"
                      startContent={<Check className="w-4 h-4" />}
                      onPress={() => {
                        handleApprove(selectedRequest.id)
                        onClose()
                      }}
                      isLoading={updatingBookingId === selectedRequest.id && updatingAction === 'approve'}
                      disabled={updatingBookingId === selectedRequest.id}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Decline Booking Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          onClose()
          setRejectReason('')
        }}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">Decline Booking Request</h2>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Please provide a reason for declining this booking request. This will be visible to the guest.
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for declining..."
                    className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={500}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    onClose()
                    setRejectReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => selectedRequest && handleDecline(selectedRequest.id)}
                  isLoading={updatingBookingId === selectedRequest?.id}
                  disabled={!rejectReason.trim() || updatingBookingId === selectedRequest?.id}
                >
                  Decline Booking
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </MainLayout>
  )
}

export default BookingRequestsPage