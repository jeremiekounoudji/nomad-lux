import React from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  ModalFooter,
  Button
} from '@heroui/react';
import { AlertCircle } from 'lucide-react';

interface BookingErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  onTryAgain: () => void;
}

const BookingErrorModal: React.FC<BookingErrorModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onTryAgain
}) => {
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
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger-100">
                <AlertCircle className="size-8 text-danger-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Failed</h2>
              <p className="mb-6 text-gray-600">
                {errorMessage}
              </p>
            </ModalBody>
            <ModalFooter className="justify-center">
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={() => { onClose(); onTryAgain(); }}>
                Try Again
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingErrorModal;
