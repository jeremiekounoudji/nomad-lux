import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea
} from '@heroui/react'
import { XCircle } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { DatabaseProperty } from '../../../../interfaces/DatabaseProperty'

interface PropertyRejectionModalProps {
  isOpen: boolean
  onClose: () => void
  property: DatabaseProperty | null
  rejectionReason: string
  onReasonChange: (reason: string) => void
  onReject: () => void
}

export const PropertyRejectionModal: React.FC<PropertyRejectionModalProps> = ({
  isOpen,
  onClose,
  property,
  rejectionReason,
  onReasonChange,
  onReject
}) => {
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <XCircle className="size-5 text-danger-500" />
          {t('propertyRejectionModal.title')}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('propertyRejectionModal.description')}
            </p>
            <Textarea
              placeholder={t('propertyRejectionModal.placeholders.reason')}
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              minRows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('propertyRejectionModal.buttons.cancel')}
          </Button>
          <Button
            color="danger"
            onPress={onReject}
            isDisabled={!rejectionReason.trim()}
            startContent={<XCircle className="size-4" />}
          >
            {t('propertyRejectionModal.buttons.rejectProperty')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 