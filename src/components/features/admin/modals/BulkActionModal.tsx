import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from '@heroui/react'
import { BulkActionModalProps } from '../../../interfaces/Component'

export const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  onClose,
  bulkActionType,
  selectedProperties,
  rejectionReason,
  setRejectionReason,
  handleBulkConfirm,
  bulkLoading
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>
        Confirm Bulk {bulkActionType === 'approve' ? 'Approval' : 'Rejection'}
      </ModalHeader>
      <ModalBody>
        <p>
          Are you sure you want to <b>{bulkActionType}</b> {selectedProperties.length} properties?
        </p>
        {bulkActionType === 'reject' && (
          <div className="mt-4">
            <Textarea
              label="Rejection Reason (applies to all)"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              minRows={2}
              required
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose} disabled={bulkLoading}>
          Cancel
        </Button>
        <Button
          color={bulkActionType === 'approve' ? 'success' : 'danger'}
          onPress={handleBulkConfirm}
          isLoading={bulkLoading}
          disabled={bulkActionType === 'reject' && !rejectionReason.trim()}
        >
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default BulkActionModal 