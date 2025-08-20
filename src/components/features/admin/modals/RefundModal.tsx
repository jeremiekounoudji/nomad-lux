import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from '@heroui/react'
import { DollarSign } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { AdminBooking } from '../../../../interfaces'

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  booking: AdminBooking | null
  refundAmount: string
  onRefundAmountChange: (amount: string) => void
  onProcessRefund: () => void
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  booking,
  refundAmount,
  onRefundAmountChange,
  onProcessRefund
}) => {
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {t('refundModal.title', { id: booking?.id })}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t('refundModal.originalPayment')}</div>
                <div className="text-2xl font-bold">${booking.totalAmount.toLocaleString()}</div>
              </div>
              
              <Input
                label={t('refundAmount')}
                placeholder={t('refundModal.refundAmountPlaceholder')}
                value={refundAmount}
                onChange={(e) => onRefundAmountChange(e.target.value)}
                startContent={<DollarSign className="w-4 h-4" />}
              />
              
              <Textarea
                label={t('refundReason')}
                placeholder={t('refundModal.refundReasonPlaceholder')}
                minRows={3}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('refundModal.buttons.cancel')}
          </Button>
          <Button
            color="primary"
            onPress={onProcessRefund}
            isDisabled={!refundAmount}
          >
            {t('refundModal.buttons.processRefund')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 