import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { BulkSuspendModalProps } from '../../../interfaces/Component'

export const BulkSuspendModal: React.FC<BulkSuspendModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  bulkSuspendLoading,
  handleBulkSuspendConfirm
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Confirm Bulk Suspension</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to suspend {selectedProperties.length} properties?</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose} disabled={bulkSuspendLoading}>
          Cancel
        </Button>
        <Button
          color="warning"
          onPress={handleBulkSuspendConfirm}
          isLoading={bulkSuspendLoading}
        >
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default BulkSuspendModal 