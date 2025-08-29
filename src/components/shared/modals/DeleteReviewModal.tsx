import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { useReview } from '../../../hooks/useReview'
import { useReviewStore } from '../../../lib/stores/reviewStore'
import StarRating from '../StarRating'

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
  const { currentReview, loading } = useReviewStore()
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
            <div className="shrink-0">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {t('review.modals.deleteTitle')}
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                {t('review.modals.deleteMessage')} This action cannot be undone.
              </p>
              
              {/* Review Preview */}
              {currentReview && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <StarRating
                      rating={currentReview.rating}
                      size="sm"
                      readonly={true}
                      showLabel={false}
                    />
                    <span className="text-sm text-gray-600">
                      {currentReview.rating}/5 stars
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-700">
                    "{currentReview.review_text}"
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(currentReview.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            className="flex-1"
            isDisabled={loading}
          >
            {t('common.buttons.cancel')}
          </Button>
          
          <Button
            color="danger"
            onPress={handleDelete}
            className="flex-1"
            isLoading={loading}
            startContent={!loading && <Trash2 className="size-4" />}
          >
            {loading ? t('common.buttons.deleting') : t('common.buttons.delete')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteReviewModal
