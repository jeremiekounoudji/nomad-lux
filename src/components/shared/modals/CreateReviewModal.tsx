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

  // Check for existing review when modal opens (optional for booking-based reviews)
  useEffect(() => {
    if (isOpen && bookingId && reviewType && user) {
      // Only check for existing reviews if it's a booking-based review
      // For public reviews, we don't need to check
      setIsVerifying(true)
      setVerificationError(null)
      setExistingReview(null)
      
      checkExistingReview(bookingId, reviewType, user.id)
        .then((result) => {
          if (result.error) {
            setVerificationError(result.error)
          } else if (!result.canReview) {
            setVerificationError(result.reason || 'You cannot create this review')
          }
          // Don't block creation if review exists - allow multiple reviews
        })
        .catch((error) => {
          console.error('Error checking existing review:', error)
          setVerificationError('Failed to verify review status')
        })
        .finally(() => {
          setIsVerifying(false)
        })
    } else if (isOpen && !bookingId && reviewType && user) {
      // For public reviews, no verification needed
      setIsVerifying(false)
      setVerificationError(null)
      setExistingReview(null)
    }
  }, [isOpen, bookingId, reviewType, user, checkExistingReview])

  const handleSubmit = async () => {
    // Allow multiple reviews - don't block if existing review is found
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
