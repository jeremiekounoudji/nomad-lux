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
import { Ban } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { DatabaseProperty } from '../../../../interfaces/DatabaseProperty'

interface PropertySuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  property: DatabaseProperty | null
  suspensionReason: string
  onReasonChange: (reason: string) => void
  onSuspend: () => void
}

export const PropertySuspensionModal: React.FC<PropertySuspensionModalProps> = ({
  isOpen,
  onClose,
  property,
  suspensionReason,
  onReasonChange,
  onSuspend
}) => {
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-warning-500" />
          {t('propertySuspensionModal.title')}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {property && (
              <>
                <div className="flex items-start gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.location.city}, {property.location.country}</p>
                    <p className="text-sm text-gray-600">{t('propertySuspensionModal.labels.hostId')} {property.host_id}</p>
                  </div>
                </div>
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-warning-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-800">{t('propertySuspensionModal.warnings.suspendProperty')}</p>
                      <p className="text-sm text-warning-700 mt-1">
                        {t('propertySuspensionModal.warnings.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                {t('propertySuspensionModal.labels.reasonForSuspension')} <span className="text-danger-500">{t('propertySuspensionModal.labels.required')}</span>
              </label>
              <Textarea
                placeholder={t('propertySuspensionModal.placeholders.reason')}
                value={suspensionReason}
                onChange={(e) => onReasonChange(e.target.value)}
                minRows={3}
                variant="bordered"
                description={t('propertySuspensionModal.descriptions.reason')}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('propertySuspensionModal.buttons.cancel')}
          </Button>
          <Button
            color="warning"
            onPress={onSuspend}
            isDisabled={!suspensionReason.trim()}
            startContent={<Ban className="w-4 h-4" />}
          >
            {t('propertySuspensionModal.buttons.suspendProperty')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 