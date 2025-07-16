import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip
} from '@heroui/react'
import { AdminBooking } from '../../../../interfaces'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: AdminBooking | null
  getStatusColor: (status: string) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  getPaymentStatusColor: (status: string) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  getStatusColor,
  getPaymentStatusColor
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader>
          Booking Details - {booking?.id}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Property and Guest Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Property Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Property:</strong> {booking.propertyTitle}</div>
                    <div><strong>Property ID:</strong> {booking.propertyId}</div>
                    <div><strong>Host:</strong> {booking.hostName}</div>
                    <div><strong>Host Email:</strong> {booking.hostEmail}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Guest:</strong> {booking.guestName}</div>
                    <div><strong>Email:</strong> {booking.guestEmail}</div>
                    <div><strong>Phone:</strong> {booking.guestPhone}</div>
                    <div><strong>Guests:</strong> {booking.guests} people</div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Check-in:</strong> {booking.checkIn}</div>
                  <div><strong>Check-out:</strong> {booking.checkOut}</div>
                  <div><strong>Nights:</strong> {booking.nights}</div>
                  <div><strong>Total Amount:</strong> ${booking.totalAmount.toLocaleString()}</div>
                  <div><strong>Booking Date:</strong> {booking.bookingDate}</div>
                  <div><strong>Status:</strong> 
                    <Chip 
                      color={getStatusColor(booking.status)} 
                      variant="flat" 
                      size="sm" 
                      className="ml-2"
                    >
                      {booking.status}
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Payment Status:</span>
                    <Chip 
                      color={getPaymentStatusColor(booking.paymentStatus)} 
                      variant="flat"
                    >
                      {booking.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.paymentStatus.replace('_', ' ').slice(1)}
                    </Chip>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: ${booking.totalAmount.toLocaleString()}
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
          <Button color="primary">
            Contact Guest
          </Button>
          <Button color="secondary">
            Contact Host
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 