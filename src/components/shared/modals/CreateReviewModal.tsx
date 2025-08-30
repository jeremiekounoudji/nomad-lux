import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, Alert } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'
import ReviewForm from '../ReviewForm'
import { useReview } from '../../../hooks/useReview'
import { useAuthStore } from '../../../lib/stores/authStore'
import { Review } from '../../../interfaces/Review'

interface CreateReviewModalProps {
  isOpen: boolean
  onClose: () => void
  reviewType: string
  propertyId?: string
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  reviewType,
  propertyId
}) => {
  const { t } = useTranslation(['review', 'common'])
  const { user } = useAuthStore()
  const [/* existingReview */, setExistingReview] = useState<Review | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const {
    formState,
    setFormState,
    handleCreateReview,
    closeModal,
    /* checkExistingReview */ // Commented out unused function
  } = useReview(propertyId)

  // For public reviews, no verification needed
  useEffect(() => {
    if (isOpen && reviewType && user) {
      setIsVerifying(false)
      setVerificationError(null)
      setExistingReview(null)
    }
  }, [isOpen, reviewType, user])

  const handleSubmit = async () => {
    // For public reviews, always allow creation
    await handleCreateReview(reviewType)
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
          {isVerifying && (
            <div className="mb-4">
              <Alert color="primary" className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-b-2 border-current"></div>
                  <span>{t('review.verification.checking')}</span>
                </div>
              </Alert>
            </div>
          )}

          {verificationError && (
            <Alert color="danger" className="mb-4">
              <span>{verificationError}</span>
            </Alert>
          )}

          {!isVerifying && !verificationError && (
            <ReviewForm
              formState={formState}
              onFormChange={setFormState}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              mode="create"
              reviewType={reviewType}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreateReviewModal
