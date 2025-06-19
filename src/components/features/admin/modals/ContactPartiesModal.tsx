import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from '@heroui/react'
import { Phone, Mail, User, Home, Shield, MessageSquare } from 'lucide-react'
import { Booking } from './bookingTypes'

interface ContactPartiesModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export const ContactPartiesModal: React.FC<ContactPartiesModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-500" />
          Contact Information - {booking?.id}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Property Information */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={booking.propertyImage}
                  alt={booking.propertyTitle}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{booking.propertyTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {booking.checkIn} → {booking.checkOut} • {booking.nights} nights
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.guests} guests • ${booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest Contact */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900">Guest</h3>
                        <p className="text-sm text-blue-700">Booking party</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Name</label>
                        <p className="font-semibold text-blue-900">{booking.guestName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <a 
                            href={`tel:${booking.guestPhone}`}
                            className="font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                          >
                            {booking.guestPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a 
                            href={`mailto:${booking.guestEmail}`}
                            className="font-semibold text-blue-900 hover:text-blue-700 transition-colors truncate"
                          >
                            {booking.guestEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Phone className="w-4 h-4" />}
                        onPress={() => window.open(`tel:${booking.guestPhone}`)}
                        className="flex-1"
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Mail className="w-4 h-4" />}
                        onPress={() => window.open(`mailto:${booking.guestEmail}`)}
                        className="flex-1"
                      >
                        Email
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* Host Contact */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">Host</h3>
                        <p className="text-sm text-green-700">Property owner</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Name</label>
                        <p className="font-semibold text-green-900">{booking.hostName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <a 
                            href={`tel:${booking.hostPhone}`}
                            className="font-semibold text-green-900 hover:text-green-700 transition-colors"
                          >
                            {booking.hostPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <a 
                            href={`mailto:${booking.hostEmail}`}
                            className="font-semibold text-green-900 hover:text-green-700 transition-colors truncate"
                          >
                            {booking.hostEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Phone className="w-4 h-4" />}
                        onPress={() => window.open(`tel:${booking.hostPhone}`)}
                        className="flex-1"
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Mail className="w-4 h-4" />}
                        onPress={() => window.open(`mailto:${booking.hostEmail}`)}
                        className="flex-1"
                      >
                        Email
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Emergency Contact Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Emergency Contact Protocol</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Contact both parties for disputes or emergencies. Document all communication for legal compliance.
                      For urgent matters, call first then follow up with email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            startContent={<MessageSquare className="w-4 h-4" />}
          >
            Create Support Ticket
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 