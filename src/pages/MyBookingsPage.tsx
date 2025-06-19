import React, { useState } from 'react'
import { Card, CardBody, Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Chip, Divider } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, MessageCircle, User, Home, Eye, DollarSign, X } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { MyBookingsPageProps, Booking } from '../interfaces'
import { CancelBookingModal } from '../components/shared'

const mockBookings: Booking[] = [
  {
    id: '1',
    propertyName: 'GastronomicGrove',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    location: '5502 Preston Rd, Inglewood',
    rating: 4.8,
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    guests: 2,
    totalPrice: 450,
    status: 'completed',
    hostName: 'Maria Rodriguez',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    hostPhone: '+1 (555) 123-4567',
    hostEmail: 'maria@example.com',
    bookingDate: '2024-01-20',
    paymentMethod: 'Visa ending in 4242',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Pool'],
    cleaningFee: 25,
    serviceFee: 35,
    taxes: 40,
    bookingTimeline: [
      { date: '2024-01-20', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' },
      { date: '2024-02-14', event: 'Check-in Instructions', description: 'Host sent check-in instructions' },
      { date: '2024-02-15', event: 'Checked In', description: 'Successfully checked into the property' },
      { date: '2024-02-18', event: 'Checked Out', description: 'Completed stay and checked out' }
    ]
  },
  {
    id: '2',
    propertyName: 'AmbrosiaArcade',
    propertyImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    location: '6391 Elgin St, Celina, Delaware',
    rating: 4.4,
    checkIn: '2024-03-10',
    checkOut: '2024-03-13',
    guests: 4,
    totalPrice: 320,
    status: 'active',
    hostName: 'John Smith',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    hostPhone: '+1 (555) 987-6543',
    hostEmail: 'john@example.com',
    bookingDate: '2024-02-25',
    paymentMethod: 'Mastercard ending in 8888',
    specialRequests: 'Late check-in requested',
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Spa'],
    cleaningFee: 30,
    serviceFee: 25,
    taxes: 35,
    bookingTimeline: [
      { date: '2024-02-25', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' },
      { date: '2024-03-09', event: 'Reminder Sent', description: 'Check-in reminder sent to your email' }
    ]
  },
  {
    id: '3',
    propertyName: 'TasteTrove Tavern',
    propertyImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    location: '3891 Ranchview Dr, Richardson',
    rating: 4.3,
    checkIn: '2024-04-05',
    checkOut: '2024-04-08',
    guests: 3,
    totalPrice: 280,
    status: 'active',
    hostName: 'Sarah Johnson',
    hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    hostPhone: '+1 (555) 456-7890',
    hostEmail: 'sarah@example.com',
    bookingDate: '2024-03-01',
    paymentMethod: 'Amex ending in 1234',
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Garden'],
    cleaningFee: 20,
    serviceFee: 30,
    taxes: 25,
    bookingTimeline: [
      { date: '2024-03-01', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' }
    ]
  },
  {
    id: '4',
    propertyName: 'RadiantRepast',
    propertyImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    location: '1901 Thornridge Cir, Shiloh',
    rating: 4.9,
    checkIn: '2024-01-20',
    checkOut: '2024-01-23',
    guests: 2,
    totalPrice: 380,
    status: 'cancelled',
    hostName: 'Michael Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    hostPhone: '+1 (555) 321-0987',
    hostEmail: 'michael@example.com',
    bookingDate: '2024-01-05',
    paymentMethod: 'Visa ending in 5678',
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'AC'],
    cleaningFee: 25,
    serviceFee: 30,
    taxes: 35,
    bookingTimeline: [
      { date: '2024-01-05', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' },
      { date: '2024-01-18', event: 'Booking Cancelled', description: 'Booking was cancelled due to host unavailability' }
    ]
  },
  {
    id: '5',
    propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    location: '2847 Sunset Blvd, Los Angeles',
    rating: 4.6,
    checkIn: '2024-05-15',
    checkOut: '2024-05-18',
    guests: 6,
    totalPrice: 520,
    status: 'active',
    hostName: 'Lisa Wang',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    hostPhone: '+1 (555) 789-0123',
    hostEmail: 'lisa@example.com',
    bookingDate: '2024-04-01',
    paymentMethod: 'Visa ending in 9999',
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Garden'],
    cleaningFee: 40,
    serviceFee: 45,
    taxes: 55,
    bookingTimeline: [
      { date: '2024-04-01', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' }
    ]
  },
  {
    id: '6',
    propertyName: 'Ocean Breeze Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    location: '1234 Ocean Drive, Miami',
    rating: 4.7,
    checkIn: '2024-06-10',
    checkOut: '2024-06-13',
    guests: 4,
    totalPrice: 390,
    status: 'completed',
    hostName: 'Carlos Martinez',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    hostPhone: '+1 (555) 654-3210',
    hostEmail: 'carlos@example.com',
    bookingDate: '2024-05-01',
    paymentMethod: 'Mastercard ending in 7777',
    amenities: ['WiFi', 'Beach Access', 'Kitchen', 'Balcony'],
    cleaningFee: 30,
    serviceFee: 35,
    taxes: 40,
    bookingTimeline: [
      { date: '2024-05-01', event: 'Booking Confirmed', description: 'Your booking has been confirmed by the host' },
      { date: '2024-06-09', event: 'Check-in Instructions', description: 'Host sent check-in instructions' },
      { date: '2024-06-10', event: 'Checked In', description: 'Successfully checked into the property' },
      { date: '2024-06-13', event: 'Checked Out', description: 'Completed stay and checked out' }
    ]
  }
]

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onPageChange }) => {
  const [selectedTab, setSelectedTab] = useState<string>('active')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure()

  const filteredBookings = mockBookings.filter(booking => booking.status === selectedTab)

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

  const getStatusActions = (booking: Booking) => {
    switch (booking.status) {
      case 'active':
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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    onOpen()
  }

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking)
    onCancelOpen()
  }

  const handleConfirmCancel = (reason: string) => {
    console.log('Cancelling booking:', bookingToCancel?.id, 'Reason:', reason)
    // Here you would typically make an API call to cancel the booking
    // For now, just close the modal
    setBookingToCancel(null)
    onCancelClose()
  }

  const stats = {
    active: mockBookings.filter(b => b.status === 'active').length,
    completed: mockBookings.filter(b => b.status === 'completed').length,
    cancelled: mockBookings.filter(b => b.status === 'cancelled').length
  }

  const totalSpent = mockBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0)
  const avgRating = mockBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.rating, 0) / mockBookings.filter(b => b.status === 'completed').length

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

          {/* Tabs */}
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
              <Tab key="active" title={`Active (${stats.active})`} />
              <Tab key="completed" title={`Completed (${stats.completed})`} />
              <Tab key="cancelled" title={`Cancelled (${stats.cancelled})`} />
            </Tabs>
          </div>
        </div>

        {/* Bookings Grid - 3 on large, 2 on medium, 1 on small */}
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="col-span-1">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                {/* Property Image with Status */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleBookingClick(booking)}
                >
                  <img
                    src={booking.propertyImage}
                    alt={booking.propertyName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Chip 
                      color={getStatusColor(booking.status)}
                      variant="solid"
                      size="sm"
                      className="text-white font-medium"
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Chip>
                  </div>
                </div>

                <CardBody className="p-4">
                  {/* Property Info */}
                  <div className="space-y-3">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {booking.propertyName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{booking.rating}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        ${booking.totalPrice}
                      </span>
                      <span className="text-sm text-gray-500">
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      {getStatusActions(booking)}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedTab} bookings
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'active' && "You don't have any active bookings at the moment."}
              {selectedTab === 'completed' && "You haven't completed any bookings yet."}
              {selectedTab === 'cancelled' && "You don't have any cancelled bookings."}
            </p>
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
                        src={selectedBooking.propertyImage}
                        alt={selectedBooking.propertyName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{selectedBooking.propertyName}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedBooking.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedBooking.rating}</span>
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
                        <Avatar src={selectedBooking.hostAvatar} size="md" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedBooking.hostName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{selectedBooking.hostPhone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{selectedBooking.hostEmail}</span>
                            </div>
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
                          <p className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{selectedBooking.guests} guest{selectedBooking.guests > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Booking Date</p>
                          <p className="font-medium">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
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
                          <span>${(selectedBooking.totalPrice - selectedBooking.cleaningFee - selectedBooking.serviceFee - selectedBooking.taxes).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning fee</span>
                          <span>${selectedBooking.cleaningFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>${selectedBooking.serviceFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>${selectedBooking.taxes}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${selectedBooking.totalPrice}</span>
                        </div>
                        <div className="mt-2 text-gray-600">
                          <p>Payment method: {selectedBooking.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Amenities */}
                    <div>
                      <h4 className="font-semibold mb-3">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.amenities.map((amenity, index) => (
                          <Chip key={index} variant="flat" size="sm">
                            {amenity}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedBooking.specialRequests && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="font-semibold mb-3">Special Requests</h4>
                          <p className="text-sm text-gray-600">{selectedBooking.specialRequests}</p>
                        </div>
                      </>
                    )}

                    <Divider />

                    {/* Booking Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Booking Timeline
                      </h4>
                      <div className="space-y-3">
                        {selectedBooking.bookingTimeline.map((event, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{event.event}</p>
                                <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-600">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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

      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={isCancelOpen}
          onClose={onCancelClose}
          booking={bookingToCancel}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </>
  )
}

export default MyBookingsPage 