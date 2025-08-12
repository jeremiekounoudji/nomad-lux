import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardBody, Button, Avatar, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab, Pagination } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, User, Home, Eye, DollarSign, Check, X, ClipboardList } from 'lucide-react'

import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { BookingRequestsPageProps, BookingRequest, BookingStatus, PaginationParams } from '../interfaces'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
// removed unused LoadingSkeleton
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

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

const BookingRequestsPage: React.FC<BookingRequestsPageProps> = () => {
  const { t } = useTranslation(['booking', 'common'])
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
  const { 
    isOpen: isDeclineModalOpen, 
    onOpen: onDeclineModalOpen, 
    onClose: onDeclineModalClose 
  } = useDisclosure()
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose
  } = useDisclosure()

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

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;
    
    try {
      await handleApprove(selectedRequest.id);
      onConfirmModalClose();
    } catch (error) {
      console.error('Error in approval confirmation:', error);
    }
  };

  const currentRequests = bookingRequestsByStatus[selectedTab] || []
  const currentPagination = paginationData[selectedTab]

  // Remove incorrect requests initialization and use currentRequests directly
  const requests = currentRequests;

  const mapStatusKey = (status: BookingStatus | 'no_shows') => {
    switch (status) {
      case 'accepted-and-waiting-for-payment':
        return 'acceptedWaitingPayment'
      case 'payment-failed':
        return 'paymentFailed'
      case 'no_shows':
        return 'noShow'
      default:
        return status
    }
  }

  const tabTitle = (status: BookingStatus) => `${t(`booking.status.${mapStatusKey(status)}`)} (${requestCounts[status]})`
  const emptyStatusLabel = useMemo(() => t(`booking.status.${mapStatusKey(selectedTab)}`), [selectedTab, t])

  return (
    <>
      {/* Header Section - Full Width */}
      <div className="col-span-full mb-6">
        {/* Banner Header */}
        <PageBanner
          backgroundImage={getBannerConfig('bookingRequests').image}
          title={t('booking.bookingRequests.banner.title')}
          subtitle={t('booking.bookingRequests.banner.subtitle')}
          imageAlt={getBannerConfig('bookingRequests').alt}
          overlayOpacity={getBannerConfig('bookingRequests').overlayOpacity}
          height={getBannerConfig('bookingRequests').height}
          className="mb-8"
        />

        {/* Tabs */}
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={handleTabChange}
              variant="underlined"
              classNames={{
                tabList: "gap-3 sm:gap-6 w-max sm:w-full relative rounded-none p-0 border-b border-divider min-w-full",
                cursor: "w-full bg-primary-500",
                tab: "max-w-fit px-2 sm:px-0 h-12 flex-shrink-0",
                tabContent: "group-data-[selected=true]:text-primary-600 text-sm sm:text-base whitespace-nowrap"
              }}
            >
              <Tab key="pending" title={tabTitle('pending')} />
              <Tab key="confirmed" title={tabTitle('confirmed')} />
              <Tab key="cancelled" title={tabTitle('cancelled')} />
              <Tab key="completed" title={tabTitle('completed')} />
              <Tab key="rejected" title={tabTitle('rejected')} />
              <Tab key="accepted-and-waiting-for-payment" title={tabTitle('accepted-and-waiting-for-payment')} />
              <Tab key="payment-failed" title={tabTitle('payment-failed')} />
            </Tabs>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingHostRequests ? (
        <div className="col-span-full text-center py-12">
          <span className="text-lg text-gray-500">{t('booking.bookingRequests.loading')}</span>
        </div>
      ) : error ? (
        <div className="col-span-full text-center py-12 text-red-600">
          {error}
        </div>
      ) : requests.length > 0 ? (
        <>
          {/* Requests Grid */}
          <div className="col-span-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden w-full min-w-0">
                    <CardBody className="p-3 sm:p-4">
                      {/* Property Image */}
                      <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden mb-3">
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
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <Avatar
                          src={request.guest_avatar_url}
                          name={request.guest_display_name}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {request.guest_display_name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{request.guest_rating} ({t('booking.reviews.count', { count: request.total_guest_reviews })})</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-2 text-xs sm:text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(request.check_in_date).toLocaleDateString()} - {new Date(request.check_out_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{t('booking.labels.guests')}: {request.guest_count}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">${request.total_amount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {request.check_in_time} - {request.check_out_time}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info - Mobile Optimized */}
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          startContent={<Mail className="w-3 h-3 sm:w-4 sm:h-4" />}
                          onClick={() => window.location.href = `mailto:${request.guest_email}`}
                          className="text-xs sm:text-sm justify-start min-w-0"
                        >
                          <span className="truncate">{request.guest_email}</span>
                        </Button>
                        {request.guest_phone && (
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            startContent={<Phone className="w-3 h-3 sm:w-4 sm:h-4" />}
                            onClick={() => window.location.href = `tel:${request.guest_phone}`}
                            className="text-xs sm:text-sm justify-start"
                          >
                            {request.guest_phone}
                          </Button>
                        )}
                      </div>



                      {/* Status Badge */}
                      <div className="mb-3">
                        <Chip
                          color={getStatusColor(request.status as BookingStatus | 'no_shows')}
                          variant="flat"
                          size="sm"
                          className="text-xs"
                        >
                          {t(`booking.status.${mapStatusKey(request.status as BookingStatus)}`)}
                        </Chip>
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="space-y-2">
                          {/* Primary Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              startContent={<X className="w-4 h-4" />}
                              onPress={() => {
                                setSelectedRequest(request)
                                onDeclineModalOpen()
                              }}
                              className="flex-1 font-medium"
                              isLoading={updatingBookingId === request.id && updatingAction === 'decline'}
                              disabled={updatingBookingId === request.id}
                            >
                              {t('booking.actions.decline')}
                            </Button>
                            <Button
                              size="sm"
                              color="success"
                              startContent={<Check className="w-4 h-4" />}
                              onPress={() => {
                                setSelectedRequest(request)
                                onConfirmModalOpen()
                              }}
                              className="flex-1 font-medium"
                              isLoading={updatingBookingId === request.id && updatingAction === 'approve'}
                              disabled={updatingBookingId === request.id}
                            >
                              {t('booking.actions.approve')}
                            </Button>
                          </div>
                          {/* Secondary Action */}
                          <Button
                            size="sm"
                            variant="bordered"
                            color="default"
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => handleRequestClick(request)}
                            disabled={updatingBookingId === request.id}
                            className="w-full font-medium"
                          >
                            {t('booking.actions.viewDetails')}
                          </Button>
                        </div>
                      )}

                      {/* View Details for non-pending requests */}
                      {request.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="bordered"
                          color="default"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() => handleRequestClick(request)}
                          className="w-full font-medium"
                        >
                          {t('booking.actions.viewDetails')}
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                ))}
            </div>
          </div>
          
          {/* Pagination - Full Width */}
          {currentPagination && currentPagination.totalPages > 1 && (
            <div className="col-span-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                {t('booking.bookingRequests.showingRange', { from: ((currentPagination.currentPage - 1) * ITEMS_PER_PAGE) + 1, to: Math.min(currentPagination.currentPage * ITEMS_PER_PAGE, currentPagination.totalItems), total: currentPagination.totalItems })}
              </div>
              <Pagination
                total={currentPagination.totalPages}
                page={currentPagination.currentPage}
                onChange={handlePageChange}
                size="sm"
                showControls
                className="order-1 sm:order-2"
              />
            </div>
          )}
        </>
      ) : (
        <div className="col-span-full text-center py-12">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('booking.bookingRequests.emptyTitle', { status: emptyStatusLabel })}
          </h3>
          <p className="text-gray-500">
            {t('booking.bookingRequests.emptyDescription', { status: emptyStatusLabel })}
          </p>
        </div>
      )}

      {/* Request Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "mx-2 my-2 sm:mx-6 sm:my-6",
          wrapper: "items-end sm:items-center"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 p-4 sm:p-6 pb-2 sm:pb-4">
                <h2 className="text-lg sm:text-xl font-bold">{t('booking.bookingRequests.details.title')}</h2>
                <p className="text-xs sm:text-sm text-gray-600">{t('booking.bookingRequests.details.subtitle')}</p>
              </ModalHeader>
              <ModalBody className="px-4 sm:px-6 py-2 sm:py-4">
                {selectedRequest && (
                  <div className="space-y-4 sm:space-y-8">
                    {/* Property Details */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('booking.bookingRequests.details.propertyInformation')}</h4>
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
                            <span>{t('booking.bookingRequests.details.locationPlaceholder')}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Home className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{t('booking.bookingRequests.details.propertyTypePlaceholder')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('booking.bookingRequests.details.guestInformation')}</h4>
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
                                {selectedRequest.guest_rating} ({t('booking.reviews.count', { count: selectedRequest.total_guest_reviews })})
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
                      <h4 className="font-semibold mb-3">{t('booking.bookingRequests.details.bookingDetails')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">{t('booking.labels.checkIn')}</p>
                                <p className="text-gray-600">
                                  {new Date(selectedRequest.check_in_date).toLocaleDateString()}
                                  <span className="ml-2">{selectedRequest.check_in_time}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">{t('booking.labels.checkOut')}</p>
                                <p className="text-gray-600">
                                  {new Date(selectedRequest.check_out_date).toLocaleDateString()}
                                  <span className="ml-2">{selectedRequest.check_out_time}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">{t('booking.labels.guests')}</p>
                                <p className="text-gray-600">{selectedRequest.guest_count} {t('booking.labels.guests')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">{t('booking.bookingRequests.details.totalAmount')}</p>
                                <p className="text-gray-600">${selectedRequest.total_amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium">{t('booking.bookingRequests.details.paymentStatus')}</p>
                                <p className="text-gray-600">{t('booking.payment.pending')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedRequest.special_requests && (
                      <div>
                        <h4 className="font-semibold mb-3">{t('booking.labels.specialRequests')}</h4>
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 break-words whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                            {selectedRequest.special_requests}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {t('booking.bookingRequests.details.timeline')}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-sm">{t('booking.bookingRequests.details.requestCreated')}</p>
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
              <ModalFooter className="p-4 sm:p-6 pt-2 sm:pt-4">
                <Button color="default" variant="light" onPress={onClose}>
                  {t('common.buttons.close')}
                </Button>
                {selectedRequest && selectedRequest.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<X className="w-4 h-4" />}
                      onPress={() => {
                        onClose()
                        onDeclineModalOpen()
                      }}
                      isLoading={updatingBookingId === selectedRequest.id && updatingAction === 'decline'}
                      disabled={updatingBookingId === selectedRequest.id}
                    >
                      {t('booking.actions.decline')}
                    </Button>
                    <Button
                      color="success"
                      startContent={<Check className="w-4 h-4" />}
                      onPress={() => {
                        onClose()
                        onConfirmModalOpen()
                      }}
                      isLoading={updatingBookingId === selectedRequest.id && updatingAction === 'approve'}
                      disabled={updatingBookingId === selectedRequest.id}
                    >
                      {t('booking.actions.approve')}
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
        isOpen={isDeclineModalOpen} 
        onClose={() => {
          onDeclineModalClose()
          setRejectReason('')
        }}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">{t('booking.bookingRequests.decline.title')}</h2>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-gray-600">{t('booking.bookingRequests.decline.description')}</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('booking.bookingRequests.decline.placeholder')}
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
                  {t('common.buttons.cancel')}
                </Button>
                <Button
                  color="danger"
                  onPress={() => selectedRequest && handleDecline(selectedRequest.id)}
                  isLoading={updatingBookingId === selectedRequest?.id}
                  disabled={!rejectReason.trim() || updatingBookingId === selectedRequest?.id}
                >
                  {t('booking.bookingRequests.decline.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Confirm Approval Modal */}
      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={onConfirmModalClose}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">{t('booking.bookingRequests.approve.title')}</h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-600">{t('booking.bookingRequests.approve.description')}</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                >
                  {t('common.buttons.cancel')}
                </Button>
                <Button
                  color="success"
                  onPress={handleApproveConfirm}
                  isLoading={updatingBookingId === selectedRequest?.id}
                >
                  {t('booking.bookingRequests.approve.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default BookingRequestsPage