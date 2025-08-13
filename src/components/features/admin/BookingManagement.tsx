import React, { useState, useEffect, useMemo } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  useDisclosure,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner
} from '@heroui/react'
import {
  BookingDetailsModal,
  DisputeManagementModal,
  RefundModal,
  ContactPartiesModal
} from './modals'
import PaymentRecordDetailsModal from './modals/PaymentRecordDetailsModal';
import { useAdminBookings, useAdminPaymentRecords } from '../../../hooks/useAdminBookings'
import { AdminBooking } from '../../../interfaces/Booking'
import { PaymentRecord } from '../../../interfaces/PaymentRecord';
import { Search, Calendar, Eye, MessageSquare, AlertTriangle, CreditCard, RefreshCw, Flag } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface BookingManagementProps {
  onPageChange?: (page: string) => void
}

// Mock disputes data - this would come from a disputes table in a real implementation
const mockDisputes = [
  {
    id: 'D001',
    bookingId: 'BK001',
    type: 'property_issue' as const,
    priority: 'high' as const,
    reporter: 'guest' as const,
    description: 'Property was not clean upon arrival, and several amenities listed were not available.',
    status: 'investigating' as const,
    createdDate: '2024-02-16',
    assignedTo: 'Admin Team',
    messages: [
      {
        id: 'M001',
        sender: 'John Smith',
        message: 'The property was not clean when we arrived, and the pool was not accessible as advertised.',
        timestamp: '2024-02-16 14:30',
        isAdmin: false
      },
      {
        id: 'M002',
        sender: 'Admin Support',
        message: 'Thank you for reporting this issue. We are investigating and will contact the host immediately.',
        timestamp: '2024-02-16 15:45',
        isAdmin: true
      }
    ]
  }
]

export const BookingManagement: React.FC<BookingManagementProps> = () => {
  const { t } = useTranslation(['admin', 'booking', 'common', 'notifications'])
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [disputeMessage, setDisputeMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    disputes: 0,
    revenue: 0
  })

  // Use admin bookings hook (returns AdminBooking[])
  const {
    bookings: adminBookings,
    isLoading,
    error,
    pagination,
    loadAdminBookings,
    getBookingStats,
    processRefund,
    clearError
  } = useAdminBookings();

  // Payment Records State
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const {
    paymentRecords,
    isLoading: paymentLoading,
    error: paymentError,
    pagination: paymentPagination,
    loadAdminPaymentRecords,
    clearError: clearPaymentError
  } = useAdminPaymentRecords();
  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose
  } = useDisclosure();

  // Computed filtered bookings for client-side filtering (in addition to server-side)
  const filteredBookings: AdminBooking[] = useMemo(() => {
    const safeSearch = (searchQuery || '').toLowerCase();
    if (!adminBookings || adminBookings.length === 0) return [];
    return adminBookings.filter((booking) => {
      const matchesSearch =
        safeSearch === '' ||
        (booking.id?.toLowerCase() || '').includes(safeSearch) ||
        (booking.guestName?.toLowerCase() || '').includes(safeSearch) ||
        (booking.hostName?.toLowerCase() || '').includes(safeSearch) ||
        (booking.propertyTitle?.toLowerCase() || '').includes(safeSearch);
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [adminBookings, searchQuery, filterStatus]);

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDisputeOpen, 
    onOpen: onDisputeOpen, 
    onClose: onDisputeClose 
  } = useDisclosure()
  const {
    isOpen: isRefundOpen,
    onOpen: onRefundOpen,
    onClose: onRefundClose
  } = useDisclosure()
  const {
    isOpen: isContactOpen,
    onOpen: onContactOpen,
    onClose: onContactClose
  } = useDisclosure()

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadAdminBookings(1, { status: filterStatus, search: searchQuery })
        const stats = await getBookingStats()
        setBookingStats(stats)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      }
    }

    loadInitialData()
  }, [])

  // Load payment records on tab switch
  useEffect(() => {
    if (selectedTab === 'payments') {
      loadAdminPaymentRecords(1);
    }
  }, [selectedTab]);

  // Handle search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadAdminBookings(1, { 
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchQuery || undefined
      })
    }, 500) // Debounce search

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, filterStatus, loadAdminBookings])

  // Handle pagination
  const handlePageChange = async (page: number) => {
    await loadAdminBookings(page, {
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: searchQuery || undefined
    })
  }

  // Payment pagination handler
  const handlePaymentPageChange = async (page: number) => {
    await loadAdminPaymentRecords(page);
  };

  const handleViewBooking = (booking: AdminBooking) => {
    setSelectedBooking(booking)
    onOpen()
  }

  const handleContactParties = (booking: AdminBooking) => {
    setSelectedBooking(booking)
    onContactOpen()
  }

  const handleViewDispute = (dispute: any) => {
    setSelectedDispute(dispute)
    onDisputeOpen()
  }

  const handleRefund = async (bookingId: string, amount: string) => {
    try {
      await processRefund(bookingId, parseFloat(amount), 'Admin processed refund')
      setRefundAmount('')
      onRefundClose()
      // Refresh bookings
      await loadAdminBookings(pagination.currentPage, {
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchQuery || undefined
      })
    } catch (error) {
      console.error('Failed to process refund:', error)
    }
  }

  const handleDisputeMessage = (disputeId: string, message: string) => {
    console.log('Sending dispute message:', disputeId, message)
    setDisputeMessage('')
    // TODO: Implement message sending
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      case 'completed': return 'primary'
      case 'dispute': return 'danger'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'refunded': return 'primary'
      case 'partial_refund': return 'secondary'
      default: return 'default'
    }
  }

  const getDisputePriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const disputeStats = {
    open: mockDisputes.filter(d => d.status === 'investigating').length, // match mock data
    investigating: mockDisputes.filter(d => d.status === 'investigating').length,
    urgent: mockDisputes.filter(d => d.priority === 'high').length // match mock data
  };

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.navigation.bookings')}</h1>
        <p className="text-gray-600 mb-4">{t('admin.dashboard.overview', { defaultValue: 'Monitor and manage all platform bookings' })}</p>
        <Card className="border-l-4 border-l-red-500 bg-red-50 w-full max-w-md">
          <CardBody className="p-6 flex flex-col items-center">
            <h4 className="font-semibold text-red-900 mb-2">{t('admin.bookings.errorLoading', { defaultValue: 'Error Loading Bookings' })}</h4>
            <p className="text-sm text-red-700 mb-4 text-center">{error}</p>
            <Button 
              size="md" 
              color="danger" 
              variant="flat"
              onPress={() => {
                clearError();
                loadAdminBookings(1, { status: filterStatus, search: searchQuery });
              }}
            >
              {t('common.actions.retry', { defaultValue: 'Retry' })}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.navigation.bookings')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.dashboard.overview', { defaultValue: 'Monitor and manage all platform bookings' })}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{bookingStats.total}</h3>
            <p className="text-white/90 font-medium">{t('admin.dashboard.totalBookings')}</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-teal-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{bookingStats.confirmed}</h3>
            <p className="text-white/90 font-medium">{t('admin.bookings.confirmedBookings')}</p>
            <p className="text-white/70 text-sm">{t('admin.bookings.currentlyConfirmed', { defaultValue: 'Currently confirmed' })}</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-orange-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{bookingStats.disputes}</h3>
            <p className="text-white/90 font-medium">{t('admin.bookings.activeDisputes', { defaultValue: 'Active Disputes' })}</p>
            <p className="text-white/70 text-sm">{t('admin.bookings.requireAttention', { defaultValue: 'Require attention' })}</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">${bookingStats.revenue.toLocaleString()}</h3>
            <p className="text-white/90 font-medium">{t('admin.bookings.revenueCompleted', { defaultValue: 'Revenue (Completed)' })}</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('admin.bookings.searchPlaceholder', { defaultValue: 'Search by booking ID, guest name, or property...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                placeholder={t('admin.bookings.filterByStatus', { defaultValue: 'Filter by status' })}
                selectedKeys={filterStatus ? [filterStatus] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFilterStatus(selectedKey || 'all')
                }}
                className="min-w-[150px]"
              >
                <SelectItem key="all">{t('admin.bookings.allStatus', { defaultValue: 'All Status' })}</SelectItem>
                <SelectItem key="confirmed">{t('booking.status.confirmed')}</SelectItem>
                <SelectItem key="pending">{t('booking.status.pending')}</SelectItem>
                <SelectItem key="completed">{t('booking.status.completed')}</SelectItem>
                <SelectItem key="cancelled">{t('booking.status.cancelled')}</SelectItem>
                <SelectItem key="dispute">{t('admin.bookings.disputes', { defaultValue: 'Disputes' })}</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <div className="w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600"
          }}
        >
          <Tab key="all" title={`${t('admin.bookings.allBookings')} (${pagination.totalItems})`} />
          <Tab key="disputes" title={`${t('admin.bookings.disputes', { defaultValue: 'Disputes' })} (${disputeStats.open + disputeStats.investigating})`} />
          <Tab key="payments" title={t('admin.payments.paymentTracking', { defaultValue: 'Payment Tracking' })} />
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
          <Spinner size="lg" className="mb-4" />
          <span className="text-lg text-gray-600">{t('admin.bookings.loading', { defaultValue: 'Loading bookings...' })}</span>
        </div>
      )}

      {/* Bookings List */}
      {selectedTab === 'all' && !isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking: AdminBooking) => (
              <Card key={booking.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardBody className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
                        }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{booking.propertyTitle}</h3>
                            <Chip
                              color={getStatusColor(booking.status)}
                              variant="flat"
                              size="sm"
                            >
                              {t(`booking.status.${booking.status}`, { defaultValue: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) })}
                            </Chip>
                            <Chip
                              color={getPaymentStatusColor(booking.paymentStatus)}
                              variant="flat"
                              size="sm"
                            >
                              {t(`admin.payments.status.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.paymentStatus.replace('_', ' ').slice(1) })}
                            </Chip>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{t('admin.bookings.labels.id', { defaultValue: 'ID:' })}</span>
                              <span className="font-mono">{booking.id}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{t('admin.bookings.labels.guest', { defaultValue: 'Guest:' })}</span>
                              <span>{booking.guestName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{t('admin.bookings.labels.host', { defaultValue: 'Host:' })}</span>
                              <span>{booking.hostName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">${booking.totalAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{booking.nights} {t('booking.labels.nights')} • {booking.guests} {t('booking.labels.guests')}</div>
                          <div className="text-xs text-gray-500 mt-1">Last activity: {booking.lastActivity}</div>
                        </div>
                      </div>

                      {/* Dates and Status */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.checkIn} → {booking.checkOut}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span>{t('admin.bookings.bookedOn', { defaultValue: 'Booked on {{date}}', date: booking.bookingDate })}</span>
                        </div>
                        {booking.status === 'dispute' && booking.disputeDate && (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{t('admin.bookings.disputeFiledOn', { defaultValue: 'Dispute filed on {{date}}', date: booking.disputeDate })}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleViewBooking(booking)}
                          startContent={<Eye className="w-4 h-4" />}
                        >
                          {t('admin.actions.view')}
                        </Button>
                        
                        {booking.status === 'dispute' && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<Flag className="w-4 h-4" />}
                          >
                            {t('admin.bookings.manageDispute', { defaultValue: 'Manage Dispute' })}
                          </Button>
                        )}
                        
                        {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial_refund') && (
                          <Button
                            size="sm"
                            color="secondary"
                            variant="flat"
                            onPress={() => {
                              setSelectedBooking(booking)
                              onRefundOpen()
                            }}
                            startContent={<RefreshCw className="w-4 h-4" />}
                          >
                            {t('admin.payments.refundPayment')}
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<MessageSquare className="w-4 h-4" />}
                          onPress={() => handleContactParties(booking)}
                        >
                          {t('admin.bookings.contactParties', { defaultValue: 'Contact Parties' })}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                showControls
                showShadow
                color="primary"
              />
            </div>
          )}

          {/* No bookings message */}
          {!isLoading && filteredBookings.length === 0 && (
            <Card className="shadow-sm border border-gray-200">
              <CardBody className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'No bookings have been made yet.'}
                </p>
                {(searchQuery || filterStatus !== 'all') && (
                  <Button 
                    variant="flat" 
                    onPress={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Disputes Tab - using mock data for now */}
      {selectedTab === 'disputes' && (
        <div className="space-y-4">
          {/* Dispute Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-red-600">{disputeStats.open}</div>
                <div className="text-sm text-gray-600">{t('admin.bookings.openDisputes', { defaultValue: 'Open Disputes' })}</div>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{disputeStats.investigating}</div>
                <div className="text-sm text-gray-600">{t('admin.bookings.underInvestigation', { defaultValue: 'Under Investigation' })}</div>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-purple-600">{disputeStats.urgent}</div>
                <div className="text-sm text-gray-600">{t('admin.bookings.urgentPriority', { defaultValue: 'Urgent Priority' })}</div>
              </CardBody>
            </Card>
          </div>

          {/* Disputes List */}
          {mockDisputes.map((dispute) => (
            <Card key={dispute.id} className="shadow-sm border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {t('admin.bookings.disputeNumber', { defaultValue: 'Dispute #{{id}}', id: dispute.id })}
                      </h3>
                      <Chip
                        color={getDisputePriorityColor(dispute.priority)}
                        variant="flat"
                        size="sm"
                      >
                        {`${dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)} ${t('admin.bookings.priorityLabel', { defaultValue: 'Priority' })}`}
                      </Chip>
                      <Chip
                        color={dispute.status === 'investigating' ? 'danger' : 'warning'}
                        variant="flat"
                        size="sm"
                      >
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </Chip>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div><strong>{t('admin.bookings.labels.bookingId', { defaultValue: 'Booking ID:' })}</strong> {dispute.bookingId}</div>
                      <div><strong>{t('admin.bookings.labels.type', { defaultValue: 'Type:' })}</strong> {dispute.type.replace('_', ' ')}</div>
                      <div><strong>{t('admin.bookings.labels.reporter', { defaultValue: 'Reporter:' })}</strong> {dispute.reporter}</div>
                      <div><strong>{t('admin.bookings.labels.created', { defaultValue: 'Created:' })}</strong> {dispute.createdDate}</div>
                      {dispute.assignedTo && <div><strong>{t('admin.bookings.labels.assignedTo', { defaultValue: 'Assigned to:' })}</strong> {dispute.assignedTo}</div>}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{dispute.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {t('admin.bookings.messagesCount', { count: dispute.messages.length, defaultValue: '{{count}} message' })}{dispute.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => handleViewDispute(dispute)}
                    >
                      {t('admin.bookings.manageDispute', { defaultValue: 'Manage Dispute' })}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Tracking Tab */}
      {selectedTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Records Table */}
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('admin.payments.paymentRecords', { defaultValue: 'Payment Records' })}</h3>
              {paymentError && (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-red-600 font-medium mb-2">{paymentError}</span>
                  <Button size="sm" color="danger" variant="flat" onPress={clearPaymentError}>{t('common.actions.clear', { defaultValue: 'Clear' })}</Button>
                </div>
              )}
              {paymentLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size="lg" className="mb-4" />
                  <span className="text-lg text-gray-600">{t('admin.payments.loadingRecords', { defaultValue: 'Loading payment records...' })}</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.bookings.labels.id', { defaultValue: 'ID' })}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.bookings.bookingDetails')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.payments.paymentAmount')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.bookings.paymentStatus')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.payments.paymentMethod')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('notifications.details.date', { defaultValue: 'Date' })}</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paymentRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition cursor-pointer">
                          <td className="px-4 py-2 font-mono text-xs">{record.id}</td>
                          <td className="px-4 py-2 font-mono text-xs">{record.booking_id}</td>
                          <td className="px-4 py-2 font-semibold text-green-700">{record.amount} {record.currency}</td>
                          <td className="px-4 py-2">
                            <Chip color={record.payment_status === 'completed' ? 'success' : record.payment_status === 'pending' ? 'warning' : record.payment_status === 'failed' ? 'danger' : 'default'} variant="flat" size="sm">
                              {record.payment_status.replace('_', ' ').toUpperCase()}
                            </Chip>
                          </td>
                          <td className="px-4 py-2 text-xs">{record.payment_method}</td>
                          <td className="px-4 py-2 text-xs">{record.created_at.split('T')[0]}</td>
                          <td className="px-4 py-2">
                            <Button size="sm" variant="flat" onPress={() => { setSelectedPayment(record); onPaymentOpen(); }}>{t('common.actions.view', { defaultValue: 'Details' })}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  {paymentPagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        total={paymentPagination.totalPages}
                        page={paymentPagination.currentPage}
                        onChange={handlePaymentPageChange}
                        showControls
                        showShadow
                        color="primary"
                      />
                  </div>
                  )}
                  {/* No payment records message */}
                  {!paymentLoading && paymentRecords.length === 0 && (
                    <div className="text-center text-gray-500 py-8">{t('admin.payments.noRecords', { defaultValue: 'No payment records found.' })}</div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Payment Details Modal */}
          <PaymentRecordDetailsModal
            isOpen={!!selectedPayment && isPaymentOpen}
            onClose={() => { setSelectedPayment(null); onPaymentClose(); }}
            paymentRecord={selectedPayment}
          />
        </div>
      )}

      {/* Modals */}
      <BookingDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        booking={selectedBooking}
        getStatusColor={getStatusColor}
        getPaymentStatusColor={getPaymentStatusColor}
      />

      <DisputeManagementModal
        isOpen={isDisputeOpen}
        onClose={onDisputeClose}
        dispute={selectedDispute}
        disputeMessage={disputeMessage}
        onDisputeMessageChange={setDisputeMessage}
        onSendMessage={() => {
          if (selectedDispute && disputeMessage.trim()) {
            handleDisputeMessage(selectedDispute.id, disputeMessage)
          }
        }}
        getDisputePriorityColor={getDisputePriorityColor}
      />

      <RefundModal
        isOpen={isRefundOpen}
        onClose={onRefundClose}
        booking={selectedBooking}
        refundAmount={refundAmount}
        onRefundAmountChange={setRefundAmount}
        onProcessRefund={() => {
          if (selectedBooking && refundAmount) {
            handleRefund(selectedBooking.id, refundAmount)
          }
        }}
      />

      <ContactPartiesModal
        isOpen={isContactOpen}
        onClose={onContactClose}
        booking={selectedBooking}
      />
    </div>
  )
} 