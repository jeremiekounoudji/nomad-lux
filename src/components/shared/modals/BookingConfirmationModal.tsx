import React from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Divider
} from '@heroui/react';
import { MapPin, Star, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../lib/stores/translationStore';
import { Property } from '../../../interfaces/Property';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  billingNights: number;
  specialRequests: string;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  isCreatingBooking: boolean;
  onConfirmBooking: () => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  property,
  checkIn,
  checkOut,
  guests,
  billingNights,
  specialRequests,
  basePrice,
  cleaningFee,
  serviceFee,
  totalAmount,
  isCreatingBooking,
  onConfirmBooking
}) => {
  const { t } = useTranslation(['booking', 'property']);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        base: "z-[9999]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">{t('booking.modals.confirmReservation.title')}</h2>
              <p className="text-sm text-gray-600">{t('booking.modals.confirmReservation.subtitle')}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="size-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="size-4" />
                      <span>{`${property.location.city}, ${property.location.country}`}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="size-4 fill-current text-yellow-500" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500">({property.review_count} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Check-in</p>
                      <p className="text-lg">{new Date(checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Check-out</p>
                      <p className="text-lg">{new Date(checkOut).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Guests</p>
                      <p className="text-lg">{guests} guest{guests > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Nights</p>
                      <p className="text-lg">{billingNights} night{billingNights > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {specialRequests && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Special Requests</p>
                      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{specialRequests}</p>
                    </div>
                  )}
                </div>

                <Divider />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                                <span>{property.currency} {property.price} × {billingNights} nights</span>
            <span>{property.currency} {basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${serviceFee}</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-primary-600 font-semibold text-white hover:bg-primary-700"
                onPress={onConfirmBooking}
                startContent={!isCreatingBooking && <CheckCircle className="size-4" />}
                isLoading={isCreatingBooking}
                disabled={isCreatingBooking}
              >
                {isCreatingBooking ? 'Creating Booking...' : 'Confirm Reservation'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingConfirmationModal;
