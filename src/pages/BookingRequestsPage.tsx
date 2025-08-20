import React, { useState, useEffect, useMemo } from 'react'
import { Button, useDisclosure, Tabs, Tab, Pagination } from '@heroui/react'
import { ClipboardList } from 'lucide-react'

import { PageBanner, BookingRequestCard, BookingRequestDetailsModal, DeclineBookingModal, ConfirmApprovalModal } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { BookingRequestsPageProps, BookingRequest, BookingStatus, PaginationParams } from '../interfaces'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import toast from 'react-hot-toast'
import { useTranslation } from '../lib/stores/translationStore'

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
          toast.error(t('booking.bookingRequests.messages.failedToLoadCounts'))
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
      toast.success(t('booking.bookingRequests.messages.approvedSuccessfully'))
      
      // Reload current page data
      if (user?.id) {
        loadHostBookingRequestsByStatus(selectedTab, paginationParamsByStatus[selectedTab], user.id)
        loadBookingRequestsCounts(user.id).then(counts => setRequestCounts(counts))
      }
    } catch (error) {
      console.error('❌ Error approving booking:', error)
      toast.error(t('booking.bookingRequests.messages.failedToApprove'))
    } finally {
      setUpdatingBookingId(null)
      setUpdatingAction(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast.error(t('booking.bookingRequests.messages.provideRejectReason'))
      return
    }

    setUpdatingBookingId(requestId)
    setUpdatingAction('decline')
    try {
      console.log('🔄 Declining booking:', requestId)
      await declineBooking(requestId, rejectReason)
      toast.success(t('booking.bookingRequests.messages.declinedSuccessfully'))
      
      // Reload current page data
      if (user?.id) {
        loadHostBookingRequestsByStatus(selectedTab, paginationParamsByStatus[selectedTab], user.id)
        loadBookingRequestsCounts(user.id).then(counts => setRequestCounts(counts))
      }
      onClose() // Close the modal after successful decline
      setRejectReason('') // Reset the reason
    } catch (error) {
      console.error('❌ Error declining booking:', error)
      toast.error(t('booking.bookingRequests.messages.failedToDecline'))
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
          imageAlt={t('common.pageBanner.bookingRequests')}
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
                <BookingRequestCard
                  key={request.id}
                  request={request}
                  onRequestClick={handleRequestClick}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onConfirmModalOpen={() => {
                    setSelectedRequest(request);
                    onConfirmModalOpen();
                  }}
                  onDeclineModalOpen={() => {
                    setSelectedRequest(request);
                    onDeclineModalOpen();
                  }}
                  updatingBookingId={updatingBookingId}
                  updatingAction={updatingAction}
                  getStatusColor={getStatusColor}
                  mapStatusKey={mapStatusKey}
                />
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
      <BookingRequestDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        selectedRequest={selectedRequest}
        updatingBookingId={updatingBookingId}
        updatingAction={updatingAction}
        onDeclineModalOpen={onDeclineModalOpen}
        onConfirmModalOpen={onConfirmModalOpen}
      />

      {/* Decline Booking Modal */}
      <DeclineBookingModal
        isOpen={isDeclineModalOpen}
        onClose={onDeclineModalClose}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onDecline={() => selectedRequest && handleDecline(selectedRequest.id)}
        isLoading={updatingBookingId === selectedRequest?.id}
        disabled={!rejectReason.trim() || updatingBookingId === selectedRequest?.id}
      />

      {/* Confirm Approval Modal */}
      <ConfirmApprovalModal
        isOpen={isConfirmModalOpen}
        onClose={onConfirmModalClose}
        onConfirm={handleApproveConfirm}
        isLoading={updatingBookingId === selectedRequest?.id}
      />
    </>
  )
}

export default BookingRequestsPage