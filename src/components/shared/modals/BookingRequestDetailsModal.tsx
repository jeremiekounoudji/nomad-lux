import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react';
import { Calendar, Star, Clock, CreditCard, Phone, Mail, User, MapPin, Home, DollarSign, X, Check } from 'lucide-react';
import { BookingRequest } from '../../../interfaces';
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
            <ModalHeader className="flex flex-col gap-1 p-4 pb-2 sm:p-6 sm:pb-4">
              <h2 className="text-lg font-bold sm:text-xl">{t('booking.bookingRequests.details.title')}</h2>
              <p className="text-xs text-gray-600 sm:text-sm">{t('booking.bookingRequests.details.subtitle')}</p>
            </ModalHeader>
            <ModalBody className="px-4 py-2 sm:px-6 sm:py-4">
              <div className="space-y-4 sm:space-y-8">
                {/* Property Details */}
                <div>
                  <h4 className="mb-3 font-semibold">{t('booking.bookingRequests.details.propertyInformation')}</h4>
                  <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
                    <img
                      src={selectedRequest.property_images[0]}
                      alt={selectedRequest.property_title}
                      className="size-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{selectedRequest.property_title}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="size-4" />
                        <span>{t('booking.bookingRequests.details.locationPlaceholder')}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <Home className="size-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{t('booking.bookingRequests.details.propertyTypePlaceholder')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h4 className="mb-3 font-semibold">{t('booking.bookingRequests.details.guestInformation')}</h4>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar
                        src={selectedRequest.guest_avatar_url}
                        name={selectedRequest.guest_display_name}
                        size="lg"
                      />
                      <div>
                        <p className="text-lg font-medium">
                          {selectedRequest.guest_display_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="size-4 fill-current text-yellow-500" />
                          <span>
                            {selectedRequest.guest_rating} ({t('booking.reviews.count', { count: selectedRequest.total_guest_reviews })})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        startContent={<Mail className="size-4" />}
                        className="justify-start"
                      >
                        {selectedRequest.guest_email}
                      </Button>
                      {selectedRequest.guest_phone && (
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          startContent={<Phone className="size-4" />}
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
                  <h4 className="mb-3 font-semibold">{t('booking.bookingRequests.details.bookingDetails')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">{t('booking.labels.checkIn')}</p>
                            <p className="text-gray-600">
                              {new Date(selectedRequest.check_in_date).toLocaleDateString()}
                              <span className="ml-2">{selectedRequest.check_in_time}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">{t('booking.labels.checkOut')}</p>
                            <p className="text-gray-600">
                              {new Date(selectedRequest.check_out_date).toLocaleDateString()}
                              <span className="ml-2">{selectedRequest.check_out_time}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="size-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">{t('booking.labels.guests')}</p>
                            <p className="text-gray-600">{selectedRequest.guest_count} {t('booking.labels.guests')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">{t('booking.bookingRequests.details.totalAmount')}</p>
                            <p className="text-gray-600">{formatPrice(selectedRequest.total_amount, selectedRequest.currency || 'USD')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-5 text-gray-600" />
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
                    <h4 className="mb-3 font-semibold">{t('booking.labels.specialRequests')}</h4>
                    <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600 sm:text-base">
                        {selectedRequest.special_requests}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold">
                    <Clock className="size-5" />
                    {t('booking.bookingRequests.details.timeline')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="mt-2 size-2 shrink-0 rounded-full bg-primary-500"></div>
                      <div>
                        <p className="text-sm font-medium">{t('booking.bookingRequests.details.requestCreated')}</p>
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
            <ModalFooter className="p-4 pt-2 sm:p-6 sm:pt-4">
              <Button color="default" variant="light" onPress={onClose}>
                {t('common.buttons.close')}
              </Button>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<X className="size-4" />}
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
                    startContent={<Check className="size-4" />}
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

