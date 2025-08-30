import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Spinner
} from '@heroui/react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { PayoutRequest } from '../../../../interfaces'

export interface ApproveRejectPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  request: PayoutRequest | null
  action: 'approve' | 'reject' | null
  onSubmit: (note: string) => Promise<void>
}

export const ApproveRejectPayoutModal: React.FC<ApproveRejectPayoutModalProps> = ({
  isOpen,
  onClose,
  request,
  action,
  onSubmit
}) => {
  const { t } = useTranslation(['admin', 'common'])
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!request || !action) return null

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await onSubmit(note)
      onClose()
    } catch (err: any) {
      setError(err?.message || t('admin:messages.approveRejectPayoutModal.errors.actionFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-bold">
            {action === 'approve' ? t('admin:messages.approveRejectPayoutModal.title.approve') : t('admin:messages.approveRejectPayoutModal.title.reject')}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="mb-2">
            <div className="mb-1 text-sm text-gray-600">{t('admin:messages.approveRejectPayoutModal.labels.amount')}</div>
            <div className="font-semibold">{request.currency} {request.amount.toFixed(2)}</div>
          </div>
          <div className="mb-2">
            <div className="mb-1 text-sm text-gray-600">{t('admin:messages.approveRejectPayoutModal.labels.host')}</div>
            <div className="font-semibold">{request.user_id}</div>
          </div>
          <Textarea
            label={t('admin:messages.approveRejectPayoutModal.labels.note')}
            placeholder={action === 'approve' ? t('admin:messages.approveRejectPayoutModal.placeholders.approve') : t('admin:messages.approveRejectPayoutModal.placeholders.reject')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minRows={3}
          />
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>{t('admin:messages.approveRejectPayoutModal.buttons.cancel')}</Button>
          <Button
            color={action === 'approve' ? 'primary' : 'danger'}
            variant="solid"
            onClick={handleSubmit}
            disabled={isLoading}
            startContent={isLoading ? <Spinner size="sm" /> : undefined}
            className={action === 'approve' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-red-600 text-white hover:bg-red-700'}
          >
            {isLoading ? (action === 'approve' ? t('admin:messages.approveRejectPayoutModal.buttons.approving') : t('admin:messages.approveRejectPayoutModal.buttons.rejecting')) : (action === 'approve' ? t('admin:messages.approveRejectPayoutModal.buttons.approve') : t('admin:messages.approveRejectPayoutModal.buttons.reject'))}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 