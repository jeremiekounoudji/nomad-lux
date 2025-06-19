import React, { useState } from 'react'
import { Card, CardBody, Button, Avatar, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Divider, Tabs, Tab } from '@heroui/react'
import { Calendar, MapPin, Star, Clock, CreditCard, Phone, Mail, MessageCircle, User, Home, Eye, DollarSign, Check, X, ClipboardList } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { BookingRequestsPageProps, BookingRequest } from '../interfaces'

const mockBookingRequests: BookingRequest[] = [
  {
    id: 'req-1',
    propertyName: 'Luxury Beachfront Villa',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    propertyId: 'user-1',
    guestName: 'Emily Johnson',
    guestAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    guestEmail: 'emily.johnson@email.com',
    guestPhone: '+1 (555) 123-4567',
    checkIn: '2024-03-15',
    checkOut: '2024-03-18',
    guests: 4,
    totalPrice: 1350,
    status: 'pending',
    requestDate: '2024-02-28',
    message: 'Hi! We are a family of 4 looking for a peaceful getaway. We promise to take great care of your beautiful property.',
    guestRating: 4.9,
    guestReviews: 23,
    paymentMethod: 'Visa ending in 4242',
    cleaningFee: 75,
    serviceFee: 105,
    taxes: 120
  },
  {
    id: 'req-2',
    propertyName: 'Cozy Mountain Cabin',
    propertyImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    propertyId: 'user-2',
    guestName: 'Michael Chen',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    guestEmail: 'michael.chen@email.com',
    guestPhone: '+1 (555) 987-6543',
    checkIn: '2024-04-10',
    checkOut: '2024-04-13',
    guests: 2,
    totalPrice: 540,
    status: 'pending',
    requestDate: '2024-03-01',
    message: 'Looking forward to a romantic weekend getaway in your beautiful cabin!',
    guestRating: 4.7,
    guestReviews: 15,
    paymentMethod: 'Mastercard ending in 8888',
    cleaningFee: 40,
    serviceFee: 45,
    taxes: 55
  },
  {
    id: 'req-3',
    propertyName: 'Urban Loft',
    propertyImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    propertyId: 'user-3',
    guestName: 'Sarah Williams',
    guestAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    guestEmail: 'sarah.williams@email.com',
    guestPhone: '+1 (555) 456-7890',
    checkIn: '2024-03-20',
    checkOut: '2024-03-25',
    guests: 3,
    totalPrice: 900,
    status: 'approved',
    requestDate: '2024-02-25',
    guestRating: 4.8,
    guestReviews: 31,
    paymentMethod: 'Amex ending in 1234',
    cleaningFee: 60,
    serviceFee: 75,
    taxes: 85
  },
  {
    id: 'req-4',
    propertyName: 'Countryside Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    propertyId: 'user-4',
    guestName: 'David Rodriguez',
    guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    guestEmail: 'david.rodriguez@email.com',
    guestPhone: '+1 (555) 321-0987',
    checkIn: '2024-02-10',
    checkOut: '2024-02-13',
    guests: 6,
    totalPrice: 720,
    status: 'declined',
    requestDate: '2024-01-28',
    guestRating: 4.2,
    guestReviews: 8,
    paymentMethod: 'Visa ending in 5678',
    cleaningFee: 50,
    serviceFee: 60,
    taxes: 70
  }
]

const BookingRequestsPage: React.FC<BookingRequestsPageProps> = ({ onPageChange }) => {
  const [selectedTab, setSelectedTab] = useState<string>('pending')
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredRequests = mockBookingRequests.filter(request => request.status === selectedTab)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'declined':
        return 'danger'
      default:
        return 'default'
    }
  }

  const handleRequestClick = (request: BookingRequest) => {
    setSelectedRequest(request)
    onOpen()
  }

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId)
    // TODO: Implement approval logic
  }

  const handleDecline = (requestId: string) => {
    console.log('Declining request:', requestId)
    // TODO: Implement decline logic
  }

  const stats = {
    pending: mockBookingRequests.filter(r => r.status === 'pending').length,
    approved: mockBookingRequests.filter(r => r.status === 'approved').length,
    declined: mockBookingRequests.filter(r => r.status === 'declined').length
  }

  const totalRevenue = mockBookingRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalPrice, 0)
  const avgGuestRating = mockBookingRequests.reduce((sum, r) => sum + r.guestRating, 0) / mockBookingRequests.length

  return (
    <>
      <MainLayout currentPage="requests" onPageChange={onPageChange}>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
              <p className="text-primary-100 text-lg">Manage your property booking requests</p>
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
              <Tab key="pending" title={`Pending (${stats.pending})`} />
              <Tab key="approved" title={`Approved (${stats.approved})`} />
              <Tab key="declined" title={`Declined (${stats.declined})`} />
            </Tabs>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="col-span-1">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                {/* Property Image with Status */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleRequestClick(request)}
                >
                  <img
                    src={request.propertyImage}
                    alt={request.propertyName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Chip 
                      color={getStatusColor(request.status)}
                      variant="solid"
                      size="sm"
                      className="text-white font-medium"
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Chip>
                  </div>
                </div>

                <CardBody className="p-4">
                  <div className="space-y-3">
                    {/* Property & Guest Info */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleRequestClick(request)}
                    >
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {request.propertyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar src={request.guestAvatar} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{request.guestName}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{request.guestRating} ({request.guestReviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.checkIn).toLocaleDateString()} - {new Date(request.checkOut).toLocaleDateString()}</span>
                    </div>

                    {/* Price & Guests */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        ${request.totalPrice}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.guests} guest{request.guests > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<X className="w-4 h-4" />}
                          onPress={() => handleDecline(request.id)}
                          className="flex-1"
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          startContent={<Check className="w-4 h-4" />}
                          onPress={() => handleApprove(request.id)}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          startContent={<MessageCircle className="w-4 h-4" />}
                          className="w-full"
                        >
                          Message Guest
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedTab} requests
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'pending' && "You don't have any pending booking requests."}
              {selectedTab === 'approved' && "You haven't approved any booking requests yet."}
              {selectedTab === 'declined' && "You haven't declined any booking requests."}
            </p>
          </div>
        )}
      </MainLayout>

      {/* Request Details Modal */}
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
                <h2 className="text-xl font-bold">Booking Request Details</h2>
                {selectedRequest && (
                  <p className="text-sm text-gray-600">Request ID: {selectedRequest.id}</p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-6">
                    {/* Property Info */}
                    <div className="flex gap-4">
                      <img
                        src={selectedRequest.propertyImage}
                        alt={selectedRequest.propertyName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{selectedRequest.propertyName}</h3>
                        <Chip 
                          color={getStatusColor(selectedRequest.status)}
                          variant="solid"
                          size="sm"
                          className="text-white font-medium mt-2"
                        >
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    {/* Guest Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Guest Information
                      </h4>
                      <div className="flex items-center gap-3">
                        <Avatar src={selectedRequest.guestAvatar} size="md" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedRequest.guestName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{selectedRequest.guestRating}</span>
                            <span className="text-sm text-gray-500">({selectedRequest.guestReviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{selectedRequest.guestPhone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{selectedRequest.guestEmail}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Booking Details */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Booking Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(selectedRequest.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(selectedRequest.checkOut).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{selectedRequest.guests} guest{selectedRequest.guests > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Request Date</p>
                          <p className="font-medium">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
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
                          <span>${(selectedRequest.totalPrice - selectedRequest.cleaningFee - selectedRequest.serviceFee - selectedRequest.taxes).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning fee</span>
                          <span>${selectedRequest.cleaningFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>${selectedRequest.serviceFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>${selectedRequest.taxes}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${selectedRequest.totalPrice}</span>
                        </div>
                        <div className="mt-2 text-gray-600">
                          <p>Payment method: {selectedRequest.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Guest Message */}
                    {selectedRequest.message && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Guest Message
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{selectedRequest.message}</p>
                          </div>
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
    </>
  )
}

export default BookingRequestsPage 