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
            <ModalBody className="text-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
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
