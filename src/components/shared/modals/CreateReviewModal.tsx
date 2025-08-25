import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Alert } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'
import ReviewForm from '../ReviewForm'
import { useReview } from '../../../hooks/useReview'
import { useAuthStore } from '../../../lib/stores/authStore'
import { Review } from '../../../interfaces/Review'

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
  const { user } = useAuthStore()
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const {
    formState,
    setFormState,
    handleCreateReview,
    closeModal,
    checkExistingReview
  } = useReview(propertyId)

  // Check for existing review when modal opens
  useEffect(() => {
    if (isOpen && bookingId && reviewType && user) {
      setIsVerifying(true)
      setVerificationError(null)
      setExistingReview(null)
      
      checkExistingReview(bookingId, reviewType, user.id)
        .then((result) => {
          if (result.exists && result.review) {
            setExistingReview(result.review)
          } else if (result.error) {
            setVerificationError(result.error)
          } else if (!result.canReview) {
            setVerificationError(result.reason || 'You cannot create this review')
          }
        })
        .catch((error) => {
          console.error('Error checking existing review:', error)
          setVerificationError('Failed to verify review status')
        })
        .finally(() => {
          setIsVerifying(false)
        })
    }
  }, [isOpen, bookingId, reviewType, user, checkExistingReview])

  const handleSubmit = async () => {
    if (existingReview) {
      console.log('Review already exists, cannot create duplicate')
      return
    }
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
          {isVerifying && (
            <div className="mb-4">
              <Alert color="primary" className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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

          {existingReview && (
            <Alert color="warning" className="mb-4">
              <div className="space-y-2">
                <div className="font-medium">{t('review.verification.alreadyExists')}</div>
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{t('review.rating.label')}:</span>
                    <span>{existingReview.rating}/5</span>
                  </div>
                  <div className="font-medium mb-1">{t('review.text.label')}:</div>
                  <p className="text-gray-600">{existingReview.review_text}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {t('review.created')}: {new Date(existingReview.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {!isVerifying && !verificationError && !existingReview && (
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
