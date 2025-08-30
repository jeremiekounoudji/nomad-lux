import React from 'react'
import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from '@heroui/react'
import { useTranslation } from '../../../../lib/stores/translationStore'
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
}) => {
  const { t } = useTranslation('admin')

  return (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>
        {t(`bulkActionModal.title.${bulkActionType}`)}
      </ModalHeader>
      <ModalBody>
        <p>
          {t('bulkActionModal.confirmation', { action: bulkActionType, count: selectedProperties.length })}
        </p>
        {bulkActionType === 'reject' && (
          <div className="mt-4">
            <Textarea
              label={t('bulkActionModal.labels.rejectionReason')}
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
          {t('bulkActionModal.buttons.cancel')}
        </Button>
        <Button
          color={bulkActionType === 'approve' ? 'success' : 'danger'}
          onPress={handleBulkConfirm}
          isLoading={bulkLoading}
          disabled={bulkActionType === 'reject' && !rejectionReason.trim()}
        >
          {t('bulkActionModal.buttons.confirm')}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  )
}

export default BulkActionModal 