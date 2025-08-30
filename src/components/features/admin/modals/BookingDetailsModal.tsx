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
import { useTranslation } from '../../../../lib/stores/translationStore'
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
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader>
          {t('bookingDetailsModal.title', { id: booking?.id })}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Property and Guest Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                 <div>
                   <h4 className="mb-3 font-semibold text-gray-900">{t('bookingDetailsModal.propertyInformation')}</h4>
                   <div className="space-y-2 text-sm">
                     <div><strong>{t('bookingDetailsModal.labels.property')}</strong> {booking.propertyTitle}</div>
                     <div><strong>{t('bookingDetailsModal.labels.propertyId')}</strong> {booking.propertyId}</div>
                     <div><strong>{t('bookingDetailsModal.labels.host')}</strong> {booking.hostName}</div>
                     <div><strong>{t('bookingDetailsModal.labels.hostEmail')}</strong> {booking.hostEmail}</div>
                   </div>
                 </div>
                
                                 <div>
                   <h4 className="mb-3 font-semibold text-gray-900">{t('bookingDetailsModal.guestInformation')}</h4>
                   <div className="space-y-2 text-sm">
                     <div><strong>{t('bookingDetailsModal.labels.guest')}</strong> {booking.guestName}</div>
                     <div><strong>{t('bookingDetailsModal.labels.email')}</strong> {booking.guestEmail}</div>
                     <div><strong>{t('bookingDetailsModal.labels.phone')}</strong> {booking.guestPhone}</div>
                     <div><strong>{t('bookingDetailsModal.labels.guests')}</strong> {booking.guests} {t('bookingDetailsModal.labels.people')}</div>
                   </div>
                 </div>
              </div>

              {/* Booking Details */}
                             <div>
                 <h4 className="mb-3 font-semibold text-gray-900">{t('bookingDetailsModal.bookingDetails')}</h4>
                 <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                   <div><strong>{t('bookingDetailsModal.labels.checkIn')}</strong> {booking.checkIn}</div>
                   <div><strong>{t('bookingDetailsModal.labels.checkOut')}</strong> {booking.checkOut}</div>
                   <div><strong>{t('bookingDetailsModal.labels.nights')}</strong> {booking.nights}</div>
                   <div><strong>{t('bookingDetailsModal.labels.totalAmount')}</strong> ${booking.totalAmount.toLocaleString()}</div>
                   <div><strong>{t('bookingDetailsModal.labels.bookingDate')}</strong> {booking.bookingDate}</div>
                   <div><strong>{t('bookingDetailsModal.labels.status')}</strong> 
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
                 <h4 className="mb-3 font-semibold text-gray-900">{t('bookingDetailsModal.paymentInformation')}</h4>
                 <div className="rounded-lg bg-gray-50 p-4">
                   <div className="flex items-center justify-between">
                     <span>{t('bookingDetailsModal.labels.paymentStatus')}</span>
                     <Chip 
                       color={getPaymentStatusColor(booking.paymentStatus)} 
                       variant="flat"
                     >
                       {booking.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.paymentStatus.replace('_', ' ').slice(1)}
                     </Chip>
                   </div>
                   <div className="mt-2 text-sm text-gray-600">
                     {t('bookingDetailsModal.labels.total')}: ${booking.totalAmount.toLocaleString()}
                   </div>
                 </div>
               </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('bookingDetailsModal.buttons.close')}
          </Button>
          <Button color="primary">
            {t('bookingDetailsModal.buttons.contactGuest')}
          </Button>
          <Button color="secondary">
            {t('bookingDetailsModal.buttons.contactHost')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 