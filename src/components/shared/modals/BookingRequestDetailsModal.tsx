import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react';
import { Calendar, Star, Clock, CreditCard, Phone, Mail, User, MapPin, Home, DollarSign, X, Check } from 'lucide-react';
import { BookingRequest, BookingStatus } from '../../../interfaces';
import { useTranslation } from '../../../lib/stores/translationStore';
import { formatPrice } from '../../../utils/currencyUtils';

interface BookingRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: BookingRequest | null;
  updatingBookingId: string | null;
  updatingAction: 'approve' | 'decline' | null;
  onDeclineModalOpen: () => void;
  onConfirmModalOpen: () => void;
}

const BookingRequestDetailsModal: React.FC<BookingRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedRequest,
  updatingBookingId,
  updatingAction,
  onDeclineModalOpen,
  onConfirmModalOpen
}) => {
  const { t } = useTranslation(['booking', 'common']);

  if (!selectedRequest) return null;

  return (
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
                            <p className="text-gray-600">{formatPrice(selectedRequest.total_amount, selectedRequest.currency || 'USD')}</p>
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
            </ModalBody>
            <ModalFooter className="p-4 sm:p-6 pt-2 sm:pt-4">
              <Button color="default" variant="light" onPress={onClose}>
                {t('common.buttons.close')}
              </Button>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<X className="w-4 h-4" />}
                    onPress={() => {
                      onClose();
                      onDeclineModalOpen();
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
                      onClose();
                      onConfirmModalOpen();
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
  );
};

export default BookingRequestDetailsModal;

