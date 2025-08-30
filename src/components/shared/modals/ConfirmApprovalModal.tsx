import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useTranslation } from '../../../lib/stores/translationStore';

interface ConfirmApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmApprovalModal: React.FC<ConfirmApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const { t } = useTranslation(['booking', 'common']);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-bold">{t('booking.bookingRequests.approve.title')}</h2>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">{t('booking.bookingRequests.approve.description')}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button
                color="success"
                onPress={onConfirm}
                isLoading={isLoading}
              >
                {t('booking.bookingRequests.approve.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmApprovalModal;

