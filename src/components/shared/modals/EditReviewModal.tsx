import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'
import ReviewForm from '../ReviewForm'
import { useReview } from '../../../hooks/useReview'

interface EditReviewModalProps {
  isOpen: boolean
  onClose: () => void
  reviewId: string
  propertyId?: string
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  onClose,
  reviewId,
  propertyId
}) => {
  const { t } = useTranslation(['review', 'common'])
  const {
    formState,
    setFormState,
    handleUpdateReview,
    closeModal
  } = useReview(propertyId)

  const handleSubmit = async () => {
    await handleUpdateReview(reviewId)
  }

  const handleClose = () => {
    closeModal()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('review.modals.editTitle')}
          </h2>
          <p className="text-sm text-gray-600">
            Update your review to reflect your current experience
          </p>
        </ModalHeader>

        <ModalBody>
          <ReviewForm
            formState={formState}
            onFormChange={setFormState}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            mode="edit"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default EditReviewModal
