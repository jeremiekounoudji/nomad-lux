import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useTranslation } from '../../../../lib/stores/translationStore'
// import { BulkSuspendModalProps } from '../../../interfaces/Component' // Commented out - interface not found

interface BulkSuspendModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProperties: any[]
  bulkSuspendLoading: boolean
  handleBulkSuspendConfirm: () => void
}

export const BulkSuspendModal: React.FC<BulkSuspendModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  bulkSuspendLoading,
  handleBulkSuspendConfirm
}) => {
  const { t } = useTranslation('admin')

  return (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>{t('bulkSuspendModal.title')}</ModalHeader>
      <ModalBody>
        <p>{t('bulkSuspendModal.confirmation', { count: selectedProperties.length })}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose} disabled={bulkSuspendLoading}>
          {t('bulkSuspendModal.buttons.cancel')}
        </Button>
        <Button
          color="warning"
          onPress={handleBulkSuspendConfirm}
          isLoading={bulkSuspendLoading}
        >
          {t('bulkSuspendModal.buttons.confirm')}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  )
}

export default BulkSuspendModal 