import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { AlertTriangle, Edit } from 'lucide-react'
import { PropertyEditConfirmation } from '../../../interfaces'
import { useTranslation } from '../../../lib/stores/translationStore'

interface PropertyEditConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  confirmation: PropertyEditConfirmation | null
  isLoading?: boolean
}

const PropertyEditConfirmationModal: React.FC<PropertyEditConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmation,
  isLoading = false
}) => {
  const { t } = useTranslation(['property', 'common'])
  if (!confirmation) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'paused': return 'secondary'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return t('common.status.approved')
      case 'pending': return t('common.status.pending')
      case 'paused': return t('common.status.suspended')
      case 'rejected': return t('common.status.rejected')
      default: return status
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning-500" />
                <h2 className="text-xl font-bold">{t('property.editConfirm.title')}</h2>
              </div>
              <p className="text-sm font-normal text-gray-600">
                {t('property.editConfirm.subtitle')}
              </p>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-3 rounded-lg bg-gray-50 p-3">
                  <img
                    src={confirmation.property.images[0]}
                    alt={confirmation.property.title}
                    className="size-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {confirmation.property.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {confirmation.property.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t('property.editConfirm.currentStatus')}:</span>
                      <Chip 
                        color={getStatusColor(confirmation.currentStatus)}
                        variant="solid"
                        size="sm"
                        className="text-white"
                      >
                        {getStatusLabel(confirmation.currentStatus)}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                {confirmation.willResetToPending ? (
                  <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-warning-800">
                          {t('property.editConfirm.willChangeTitle')}
                        </h4>
                        <p className="text-sm text-warning-700">
                          {t('property.editConfirm.willChangeBody', { status: getStatusLabel(confirmation.currentStatus) })}
                        </p>
                        <p className="mt-2 text-sm text-warning-700">
                          {t('property.editConfirm.reapproveNote')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Edit className="mt-0.5 size-5 shrink-0 text-blue-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-blue-800">
                          {t('property.editConfirm.safeTitle')}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {t('property.editConfirm.safeBody', { status: getStatusLabel(confirmation.currentStatus) })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>{t('property.editConfirm.confirmPrompt')}</p>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
                disabled={isLoading}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button 
                color={confirmation.willResetToPending ? "warning" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
                startContent={!isLoading && <Edit className="size-4" />}
              >
                {confirmation.willResetToPending ? t('property.editConfirm.editAndReset') : t('property.editConfirm.editProperty')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PropertyEditConfirmationModal 