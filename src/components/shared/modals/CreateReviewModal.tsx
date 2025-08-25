import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'
import ReviewForm from '../ReviewForm'
import { useReview } from '../../../hooks/useReview'

interface CreateReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  reviewType: string
  propertyId?: string
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  reviewType,
  propertyId
}) => {
  const { t } = useTranslation(['review', 'common'])
  const {
    formState,
    setFormState,
    handleCreateReview,
    closeModal
  } = useReview(propertyId)

  const handleSubmit = async () => {
    await handleCreateReview(bookingId, reviewType)
  }

  const handleClose = () => {
    closeModal()
    onClose()
  }

  const getModalTitle = () => {
    switch (reviewType) {
      case 'guest_to_host':
        return t('review.modals.createTitle') + ' - ' + t('review.reviewType.guestToHost')
      case 'host_to_guest':
        return t('review.modals.createTitle') + ' - ' + t('review.reviewType.hostToGuest')
      case 'property':
        return t('review.modals.createTitle') + ' - ' + t('review.reviewType.property')
      default:
        return t('review.modals.createTitle')
    }
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
            {getModalTitle()}
          </h2>
          <p className="text-sm text-gray-600">
            Share your experience to help other users
          </p>
        </ModalHeader>

        <ModalBody>
          <ReviewForm
            formState={formState}
            onFormChange={setFormState}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            mode="create"
            reviewType={reviewType}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreateReviewModal
