import React from 'react'
import { Card, CardBody, Spinner } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'
import PropertyCard from '../../shared/PropertyCard'
import BookingRequestCard from '../../shared/BookingRequestCard'
import { Property } from '../../../interfaces/Property'
import { BookingRequest } from '../../../interfaces/Booking'
import { BookingStatus } from '../../../interfaces'

interface TabContentProps {
  activeTab: 'properties' | 'bookings' | 'requests'
  properties: Property[]
  bookings: any[] // Will be updated with proper type when we have actual data
  requests: BookingRequest[]
  isLoading: boolean
}

const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  properties, 
  bookings, 
  requests,
  isLoading 
}) => {
  const { t } = useTranslation(['profile', 'property', 'booking', 'common'])

  // Mock functions for BookingRequestCard - in a real implementation these would be passed from parent
  const handleRequestClick = (request: BookingRequest) => {
    console.log('View request details', request.id)
  }

  const handleConfirmModalOpen = () => {
    console.log('Open confirm modal')
  }

  const handleDeclineModalOpen = () => {
    console.log('Open decline modal')
  }

  const getStatusColor = (status: BookingStatus | 'no_shows') => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'success'
      case 'completed': return 'primary'
      case 'cancelled': return 'danger'
      case 'rejected': return 'danger'
      case 'accepted-and-waiting-for-payment': return 'secondary'
      case 'payment-failed': return 'danger'
      default: return 'default'
    }
  }

  const mapStatusKey = (status: BookingStatus | 'no_shows') => {
    return status
  }

  const renderProperties = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )
    }

    if (!properties || properties.length === 0) {
      return (
        <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardBody className="p-8 text-center">
            <p className="text-gray-500">{t('property.messages.noProperties')}</p>
          </CardBody>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={() => console.log('View property details', property.id)}
            onLike={() => console.log('Like property', property.id)}
          />
        ))}
      </div>
    )
  }

  const renderBookings = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )
    }

    if (!bookings || bookings.length === 0) {
      return (
        <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardBody className="p-8 text-center">
            <p className="text-gray-500">{t('booking.messages.noBookings', { status: t('common.status.pending') })}</p>
          </CardBody>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4">
            {/* Booking card component would go here */}
            <p>Booking: {booking.id}</p>
          </div>
        ))}
      </div>
    )
  }

  const renderRequests = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )
    }

    if (!requests || requests.length === 0) {
      return (
        <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardBody className="p-8 text-center">
            <p className="text-gray-500">{t('booking.bookingRequests.emptyTitle', { status: t('common.status.pending') })}</p>
          </CardBody>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <BookingRequestCard
            key={request.id}
            request={request}
            onRequestClick={handleRequestClick}
            onApprove={() => console.log('Approve request', request.id)}
            onDecline={() => console.log('Decline request', request.id)}
            onConfirmModalOpen={handleConfirmModalOpen}
            onDeclineModalOpen={handleDeclineModalOpen}
            updatingBookingId={null}
            updatingAction={null}
            getStatusColor={getStatusColor}
            mapStatusKey={mapStatusKey}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      {activeTab === 'properties' && renderProperties()}
      {activeTab === 'bookings' && renderBookings()}
      {activeTab === 'requests' && renderRequests()}
    </div>
  )
}

export default TabContent