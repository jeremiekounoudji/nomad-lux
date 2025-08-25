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
            <ModalBody className="text-center py-8">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-danger-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h2>
              <p className="text-gray-600 mb-6">
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
