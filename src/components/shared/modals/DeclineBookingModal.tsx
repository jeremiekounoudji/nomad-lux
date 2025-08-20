import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useTranslation } from '../../../lib/stores/translationStore';

interface DeclineBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onDecline: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const DeclineBookingModal: React.FC<DeclineBookingModalProps> = ({
  isOpen,
  onClose,
  rejectReason,
  setRejectReason,
  onDecline,
  isLoading,
  disabled
}) => {
  const { t } = useTranslation(['booking', 'common']);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        onClose();
        setRejectReason('');
      }}
      size="md"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-bold">{t('booking.bookingRequests.decline.title')}</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-gray-600">{t('booking.bookingRequests.decline.description')}</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('booking.bookingRequests.decline.placeholder')}
                  className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={500}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  onClose();
                  setRejectReason('');
                }}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button
                color="danger"
                onPress={onDecline}
                isLoading={isLoading}
                disabled={disabled}
              >
                {t('booking.bookingRequests.decline.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeclineBookingModal;

