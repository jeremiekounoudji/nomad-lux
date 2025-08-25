import { useCallback, useEffect, useState } from 'react'
import { useReviewStore } from '../lib/stores/reviewStore'
import { useAuthStore } from '../lib/stores/authStore'
import { ReviewFilters, CreateReviewData, UpdateReviewData, ReviewValidation } from '../interfaces/Review'
import toast from 'react-hot-toast'

export const useReview = (propertyId?: string) => {
  const { user } = useAuthStore()
  const {
    reviews,
    reviewStats,
    loading,
    error,
    modalState,
    formState,
    fetchPropertyReviews,
    fetchUserReviews,
    createReview,
    updateReview,
    deleteReview,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    setFormState,
    resetForm,
    clearError,
    canEditReview,
    canDeleteReview,
    checkExistingReview
  } = useReviewStore()

  const [filters, setFilters] = useState<ReviewFilters>({
    sort_by: 'newest',
    page: 1,
    limit: 10
  })

  // Load reviews when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchPropertyReviews(propertyId, filters)
    }
  }, [propertyId, filters, fetchPropertyReviews])

  // Show error toasts
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Validation function
  const validateReview = useCallback((data: { rating: number; review_text: string }): ReviewValidation => {
    const errors: ReviewValidation['errors'] = {}

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5'
    }

    if (!data.review_text || data.review_text.trim().length < 10) {
      errors.review_text = 'Review must be at least 10 characters'
    } else if (data.review_text.length > 1000) {
      errors.review_text = 'Review cannot exceed 1000 characters'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [])

  // Handle review creation
  const handleCreateReview = useCallback(async (bookingId: string, reviewType: string) => {
    if (!user) {
      toast.error('You must be logged in to create a review')
      return
    }

    const validation = validateReview(formState)
    if (!validation.isValid) {
      setFormState({ errors: validation.errors })
      return
    }

    setFormState({ isSubmitting: true, errors: {} })

    const reviewData: CreateReviewData = {
      booking_id: bookingId,
      reviewer_id: user.id,
      rating: formState.rating,
      review_text: formState.review_text.trim(),
      review_type: reviewType as any
    }

    // Add property_id if we have it
    if (propertyId) {
      reviewData.property_id = propertyId
    }

    const response = await createReview(reviewData)

    if (response.success) {
      toast.success('Review submitted successfully')
      closeModal()
      resetForm()
      // Refresh reviews
      if (propertyId) {
        fetchPropertyReviews(propertyId, filters)
      }
    } else {
      toast.error(response.error || 'Failed to submit review')
      setFormState({ isSubmitting: false })
    }
  }, [user, formState, propertyId, validateReview, createReview, closeModal, resetForm, fetchPropertyReviews, filters, setFormState])

  // Handle review update
  const handleUpdateReview = useCallback(async (reviewId: string) => {
    const validation = validateReview(formState)
    if (!validation.isValid) {
      setFormState({ errors: validation.errors })
      return
    }

    setFormState({ isSubmitting: true, errors: {} })

    const updateData: UpdateReviewData = {
      rating: formState.rating,
      review_text: formState.review_text.trim()
    }

    const response = await updateReview(reviewId, updateData)

    if (response.success) {
      toast.success('Review updated successfully')
      closeModal()
      resetForm()
      // Refresh reviews
      if (propertyId) {
        fetchPropertyReviews(propertyId, filters)
      }
    } else {
      toast.error(response.error || 'Failed to update review')
      setFormState({ isSubmitting: false })
    }
  }, [formState, propertyId, validateReview, updateReview, closeModal, resetForm, fetchPropertyReviews, filters, setFormState])

  // Handle review deletion
  const handleDeleteReview = useCallback(async (reviewId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a review')
      return
    }

    const response = await deleteReview(reviewId, user.id)

    if (response.success) {
      toast.success('Review deleted successfully')
      closeModal()
      // Refresh reviews
      if (propertyId) {
        fetchPropertyReviews(propertyId, filters)
      }
    } else {
      toast.error(response.error || 'Failed to delete review')
    }
  }, [user, propertyId, deleteReview, closeModal, fetchPropertyReviews, filters])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Load more reviews (for infinite scroll)
  const loadMoreReviews = useCallback(() => {
    if (propertyId && !loading) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }, [propertyId, loading])

  // Check if user can review a booking
  const canReviewBooking = useCallback((booking: any) => {
    if (!user) return false
    if (booking.status !== 'completed') return false
    if (booking.guest_id !== user.id && booking.host_id !== user.id) return false
    
    // Check if user already reviewed this booking
    const existingReview = reviews.find(review => 
      review.booking_id === booking.id && 
      review.reviewer_id === user.id
    )
    
    return !existingReview
  }, [user, reviews])

  // Get review type for a booking
  const getReviewTypeForBooking = useCallback((booking: any) => {
    if (!user) return null
    
    if (booking.guest_id === user.id) {
      return 'guest_to_host'
    } else if (booking.host_id === user.id) {
      return 'host_to_guest'
    }
    
    return null
  }, [user])

  return {
    // State
    reviews,
    reviewStats,
    loading,
    error,
    modalState,
    formState,
    filters,

    // Actions
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
    handleFilterChange,
    handlePageChange,
    loadMoreReviews,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    setFormState,
    resetForm,
    clearError,

    // Utilities
    canReviewBooking,
    getReviewTypeForBooking,
    validateReview,
    canEditReview,
    canDeleteReview,
    checkExistingReview
  }
}
