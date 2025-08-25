import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { useReview } from '../../../hooks/useReview'

interface DeleteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  reviewId: string
  propertyId?: string
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({
  isOpen,
  onClose,
  reviewId,
  propertyId
}) => {
  const { t } = useTranslation(['review', 'common'])
  const {
    handleDeleteReview,
    closeModal
  } = useReview(propertyId)

  const handleDelete = async () => {
    await handleDeleteReview(reviewId)
    handleClose()
  }

  const handleClose = () => {
    closeModal()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('review.modals.deleteTitle')}
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this review?
              </h3>
              <p className="text-sm text-gray-600">
                {t('review.modals.deleteMessage')} This action cannot be undone.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            className="flex-1"
          >
            {t('common.buttons.cancel')}
          </Button>
          
          <Button
            color="danger"
            onPress={handleDelete}
            className="flex-1"
          >
            {t('common.buttons.delete')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteReviewModal
