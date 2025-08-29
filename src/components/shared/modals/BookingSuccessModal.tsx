import React from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  ModalFooter,
  Button
} from '@heroui/react';
import { CheckCircle } from 'lucide-react';
import { formatPrice } from '../../../utils/currencyUtils';
import { useTranslation } from '../../../lib/stores/translationStore';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  totalAmount
}) => {
  const { t } = useTranslation('booking');

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      hideCloseButton
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        base: "z-[9999]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="py-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success-100">
                <CheckCircle className="size-8 text-success-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
              <p className="mb-6 text-gray-600">
                {t('booking.messages.reservationSubmitted')}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Booking Reference:</strong> NL{Date.now().toString().slice(-6)}</p>
                <p><strong>Total Amount:</strong> {formatPrice(totalAmount, 'USD')}</p>
              </div>
            </ModalBody>
            <ModalFooter className="justify-center">
              <Button color="primary" onPress={onClose} size="lg">
                {t('booking.actions.viewMyBookings')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingSuccessModal;
