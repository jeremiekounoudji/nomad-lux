import React, { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Divider,
  Badge,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner
} from '@heroui/react'
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye
} from 'lucide-react'
import { useBookingManagement } from '../../../hooks/useBookingManagement'
import { useAuthStore } from '../../../lib/stores/authStore'
import { BookingRequest, BookingStatus } from '../../../interfaces'
import toast from 'react-hot-toast'
import { useTranslation } from '../../../lib/stores/translationStore'
import { formatPrice } from '../../../utils/currencyUtils'

interface HostBookingManagementProps {
  propertyId?: string // Optional: filter by specific property
}

const HostBookingManagement: React.FC<HostBookingManagementProps> = ({ propertyId }) => {
  const { t } = useTranslation(['booking', 'common']);
  const [selectedTab, setSelectedTab] = useState<string>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)

  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure()
  const { isOpen: isDeclineOpen, onOpen: onDeclineOpen, onClose: onDeclineClose } = useDisclosure()

  // Hooks
  const { user } = useAuthStore()
  const {
    hostBookings,
    isLoadingBookings,
    isUpdatingBooking,
    loadHostBookings,
    approveBooking,
    declineBooking,
    contactGuest
  } = useBookingManagement()

  // Load bookings on component mount
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Loading host bookings...')
      loadHostBookings(user.id, propertyId).catch(console.error)
    }
  }, [user?.id, propertyId, loadHostBookings])

  // Filter bookings based on tab and search
  const filteredBookings = useMemo(() => {
    let filtered = hostBookings

    // Filter by tab (status)
    if (selectedTab !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedTab)
    }

    // Filter by status dropdown
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.guest_name.toLowerCase().includes(searchLower) ||
        booking.property_title.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [hostBookings, selectedTab, statusFilter, searchTerm])

  // Group bookings by status for tab counts
  const bookingCounts = useMemo(() => {
    const counts = {
      all: hostBookings.length,
      pending: 0,
      approved: 0,
      declined: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }

    hostBookings.forEach(booking => {
      if (booking.status in counts) {
        counts[booking.status as keyof typeof counts]++
      }
    })

    return counts
  }, [hostBookings])

  const handleViewDetails = (booking: BookingRequest) => {
    setSelectedBooking(booking)
    onDetailsOpen()
  }

  const handleApproveBooking = async (bookingId: string) => {
    try {
      console.log('🔄 Approving booking:', bookingId)
      await approveBooking(bookingId)
      toast.success(t('booking.host.approveSuccess', { defaultValue: 'Booking approved successfully!' }))
      onApproveClose()
    } catch (error) {
      console.error('❌ Error approving booking:', error)
      toast.error(t('booking.host.approveFailed', { defaultValue: 'Failed to approve booking' }))
    }
  }

  const handleDeclineBooking = async (bookingId: string, reason?: string) => {
    try {
      console.log('🔄 Declining booking:', bookingId)
      await declineBooking(bookingId, reason)
      toast.success(t('booking.host.declineSuccess', { defaultValue: 'Booking declined' }))
      onDeclineClose()
    } catch (error) {
      console.error('❌ Error declining booking:', error)
      toast.error(t('booking.host.declineFailed', { defaultValue: 'Failed to decline booking' }))
    }
  }

  const handleContactGuest = async (booking: BookingRequest, message: string) => {
    try {
      console.log('🔄 Contacting guest for booking:', booking.id)
      await contactGuest(booking.id, message)
      toast.success(t('booking.host.messageSent', { defaultValue: 'Message sent to guest!' }))
    } catch (error) {
      console.error('❌ Error contacting guest:', error)
      toast.error(t('booking.host.messageFailed', { defaultValue: 'Failed to send message' }))
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'confirmed': return 'primary'
      case 'completed': return 'success'
      case 'declined': return 'danger'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return <Clock className="size-4" />
      case 'approved': return <CheckCircle className="size-4" />
      case 'confirmed': return <CheckCircle className="size-4" />
      case 'completed': return <CheckCircle className="size-4" />
      case 'declined': return <XCircle className="size-4" />
      case 'cancelled': return <XCircle className="size-4" />
      default: return <AlertTriangle className="size-4" />
    }
  }

  if (isLoadingBookings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">{t('booking.host.loading', { defaultValue: 'Loading your bookings...' })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('booking.host.title', { defaultValue: 'Booking Management' })}</h2>
          <p className="text-gray-600">{t('booking.host.subtitle', { defaultValue: 'Manage your property bookings and guest requests' })}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            placeholder={t('booking.host.searchPlaceholder', { defaultValue: 'Search bookings...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="size-4 text-gray-400" />}
            className="w-64"
            size="sm"
          />
          
          <Select
            placeholder={t('booking.host.filterPlaceholder', { defaultValue: 'Filter by status' })}
            selectedKeys={statusFilter !== 'all' ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const status = Array.from(keys)[0] as BookingStatus | 'all'
              setStatusFilter(status || 'all')
            }}
            className="w-48"
            size="sm"
            startContent={<Filter className="size-4" />}
          >
            <SelectItem key="all">{t('booking.host.statuses.all', { defaultValue: 'All Statuses' })}</SelectItem>
            <SelectItem key="pending">{t('booking.host.statuses.pending', { defaultValue: 'Pending' })}</SelectItem>
            <SelectItem key="approved">{t('booking.host.statuses.approved', { defaultValue: 'Approved' })}</SelectItem>
            <SelectItem key="confirmed">{t('booking.host.statuses.confirmed', { defaultValue: 'Confirmed' })}</SelectItem>
            <SelectItem key="completed">{t('booking.host.statuses.completed', { defaultValue: 'Completed' })}</SelectItem>
            <SelectItem key="declined">{t('booking.host.statuses.declined', { defaultValue: 'Declined' })}</SelectItem>
            <SelectItem key="cancelled">{t('booking.host.statuses.cancelled', { defaultValue: 'Cancelled' })}</SelectItem>
          </Select>
        </div>
      </div>

      {/* Status Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary-500",
              tab: "max-w-fit px-4 py-3 h-12",
            }}
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('booking.host.tabs.all', { defaultValue: 'All Bookings' })}</span>
                  <Badge content={bookingCounts.all} color="default" size="sm" />
                </div>
              }
            />
            <Tab
              key="pending"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('booking.host.tabs.pending', { defaultValue: 'Pending' })}</span>
                  <Badge content={bookingCounts.pending} color="warning" size="sm" />
                </div>
              }
            />
            <Tab
              key="approved"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('booking.host.tabs.approved', { defaultValue: 'Approved' })}</span>
                  <Badge content={bookingCounts.approved} color="success" size="sm" />
                </div>
              }
            />
            <Tab
              key="confirmed"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('booking.host.tabs.confirmed', { defaultValue: 'Confirmed' })}</span>
                  <Badge content={bookingCounts.confirmed} color="primary" size="sm" />
                </div>
              }
            />
            <Tab
              key="completed"
              title={
                <div className="flex items-center gap-2">
                  <span>{t('booking.host.tabs.completed', { defaultValue: 'Completed' })}</span>
                  <Badge content={bookingCounts.completed} color="success" size="sm" />
                </div>
              }
            />
          </Tabs>
        </CardBody>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <Calendar className="mx-auto mb-4 size-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('booking.host.noBookings.title', { defaultValue: 'No bookings found' })}</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? t('booking.host.noBookings.tryAdjusting', { defaultValue: 'Try adjusting your search or filter criteria' })
                  : t('booking.host.noBookings.noneYet', { defaultValue: 'You don\'t have any bookings yet' })}
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="transition-shadow hover:shadow-md">
              <CardBody className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* Guest Info */}
                  <div className="flex flex-1 items-center gap-4">
                    <Avatar
                      src={booking.guest_avatar}
                      alt={booking.guest_name}
                      size="lg"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.guest_name}</h3>
                      <p className="text-gray-600">{booking.property_title}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="size-3" />
                        <span>{booking.property_location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('booking.host.labels.checkIn', { defaultValue: 'Check-in' })}</p>
                      <p className="font-semibold">{new Date(booking.check_in).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('booking.host.labels.checkOut', { defaultValue: 'Check-out' })}</p>
                      <p className="font-semibold">{new Date(booking.check_out).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('booking.host.labels.guests', { defaultValue: 'Guests' })}</p>
                      <p className="font-semibold">{booking.guest_count}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('booking.host.labels.total', { defaultValue: 'Total' })}</p>
                      <p className="font-semibold text-green-600">{formatPrice(booking.total_amount, booking.currency || 'USD')}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                    <Chip
                      color={getStatusColor(booking.status)}
                      variant="flat"
                      startContent={getStatusIcon(booking.status)}
                      className="w-fit"
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Chip>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<Eye className="size-4" />}
                        onPress={() => handleViewDetails(booking)}
                      >
                        {t('booking.host.actions.details', { defaultValue: 'Details' })}
                      </Button>

                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            variant="light"
                            startContent={<CheckCircle className="size-4" />}
                            onPress={() => {
                              setSelectedBooking(booking)
                              onApproveOpen()
                            }}
                            isLoading={isUpdatingBooking}
                          >
                            {t('booking.host.actions.approve', { defaultValue: 'Approve' })}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            startContent={<XCircle className="size-4" />}
                            onPress={() => {
                              setSelectedBooking(booking)
                              onDeclineOpen()
                            }}
                            isLoading={isUpdatingBooking}
                          >
                            {t('booking.host.actions.decline', { defaultValue: 'Decline' })}
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="light"
                        startContent={<MessageCircle className="size-4" />}
                        onPress={() => {
                          setSelectedBooking(booking)
                          // Open contact modal (you can implement this)
                        }}
                      >
                        {t('booking.host.actions.contact', { defaultValue: 'Contact' })}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">{t('booking.host.modals.details.title', { defaultValue: 'Booking Details' })}</h2>
              </ModalHeader>
              <ModalBody>
                {selectedBooking && (
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div>
                      <h3 className="mb-3 text-lg font-semibold">{t('booking.host.modals.details.guestInfo', { defaultValue: 'Guest Information' })}</h3>
                      <div className="mb-4 flex items-center gap-4">
                        <Avatar
                          src={selectedBooking.guest_avatar}
                          alt={selectedBooking.guest_name}
                          size="lg"
                        />
                        <div>
                          <h4 className="font-semibold">{selectedBooking.guest_name}</h4>
                          <p className="text-gray-600">{selectedBooking.guest_email}</p>
                          {selectedBooking.guest_phone && (
                            <p className="text-gray-600">{selectedBooking.guest_phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Booking Information */}
                    <div>
                      <h3 className="mb-3 text-lg font-semibold">{t('booking.host.modals.details.bookingInfo', { defaultValue: 'Booking Information' })}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.property', { defaultValue: 'Property' })}</p>
                          <p className="font-semibold">{selectedBooking.property_title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.bookingId', { defaultValue: 'Booking ID' })}</p>
                          <p className="font-mono text-sm">{selectedBooking.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.checkIn', { defaultValue: 'Check-in' })}</p>
                          <p className="font-semibold">{new Date(selectedBooking.check_in).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.checkOut', { defaultValue: 'Check-out' })}</p>
                          <p className="font-semibold">{new Date(selectedBooking.check_out).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.guests', { defaultValue: 'Guests' })}</p>
                          <p className="font-semibold">{selectedBooking.guest_count}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t('booking.host.modals.details.labels.totalAmount', { defaultValue: 'Total Amount' })}</p>
                          <p className="font-semibold text-green-600">{formatPrice(selectedBooking.total_amount, selectedBooking.currency || 'USD')}</p>
                        </div>
                      </div>
                    </div>

                    {selectedBooking.special_requests && (
                      <>
                        <Divider />
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">{t('booking.host.modals.details.specialRequests', { defaultValue: 'Special Requests' })}</h3>
                          <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
                            {selectedBooking.special_requests}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t('booking.host.modals.details.close', { defaultValue: 'Close' })}
                </Button>
                {selectedBooking?.status === 'pending' && (
                  <>
                    <Button
                      color="success"
                      onPress={() => {
                        if (selectedBooking) {
                          handleApproveBooking(selectedBooking.id)
                        }
                      }}
                      isLoading={isUpdatingBooking}
                    >
                      {t('booking.host.modals.details.approveBooking', { defaultValue: 'Approve Booking' })}
                    </Button>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => {
                        onClose()
                        onDeclineOpen()
                      }}
                    >
                      {t('booking.host.modals.details.declineBooking', { defaultValue: 'Decline Booking' })}
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">{t('booking.host.modals.approve.title', { defaultValue: 'Approve Booking' })}</h2>
              </ModalHeader>
              <ModalBody>
                <p>{t('booking.host.modals.approve.message', { defaultValue: 'Are you sure you want to approve this booking? The guest will be notified and can proceed with payment.' })}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t('booking.host.modals.approve.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    if (selectedBooking) {
                      handleApproveBooking(selectedBooking.id)
                    }
                  }}
                  isLoading={isUpdatingBooking}
                >
                  {t('booking.host.modals.approve.confirm', { defaultValue: 'Approve Booking' })}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Decline Confirmation Modal */}
      <Modal isOpen={isDeclineOpen} onClose={onDeclineClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">{t('booking.host.modals.decline.title', { defaultValue: 'Decline Booking' })}</h2>
              </ModalHeader>
              <ModalBody>
                <p className="mb-4">{t('booking.host.modals.decline.message', { defaultValue: 'Are you sure you want to decline this booking? The guest will be notified.' })}</p>
                <Input
                  label={t('booking.host.modals.decline.reasonLabel', { defaultValue: 'Reason (Optional)' })}
                  placeholder={t('booking.host.modals.decline.reasonPlaceholder', { defaultValue: 'Enter reason for declining...' })}
                  className="w-full"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  {t('booking.host.modals.decline.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    if (selectedBooking) {
                      handleDeclineBooking(selectedBooking.id)
                    }
                  }}
                  isLoading={isUpdatingBooking}
                >
                  {t('booking.host.modals.decline.confirm', { defaultValue: 'Decline Booking' })}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default HostBookingManagement 