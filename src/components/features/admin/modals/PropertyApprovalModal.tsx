import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { DatabaseProperty } from '../../../../interfaces/DatabaseProperty'

interface PropertyApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  property: DatabaseProperty | null
  onApprove: () => void
}

export const PropertyApprovalModal: React.FC<PropertyApprovalModalProps> = ({
  isOpen,
  onClose,
  property,
  onApprove
}) => {
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CheckCircle className="size-5 text-success-500" />
          {t('propertyApprovalModal.title')}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {property && (
              <>
                <div className="flex items-start gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="size-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.location.city}, {property.location.country}</p>
                    <p className="text-sm text-gray-600">{t('propertyApprovalModal.labels.hostId')} {property.host_id}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-success-200 bg-success-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 text-success-500" />
                    <div>
                      <p className="font-medium text-success-800">{t('propertyApprovalModal.confirmations.readyToApprove')}</p>
                      <p className="mt-1 text-sm text-success-700">
                        {t('propertyApprovalModal.confirmations.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('propertyApprovalModal.buttons.cancel')}
          </Button>
          <Button
            color="success"
            onPress={onApprove}
            startContent={<CheckCircle className="size-4" />}
          >
            {t('propertyApprovalModal.buttons.approveProperty')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 