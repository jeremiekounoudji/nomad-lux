import { create } from 'zustand'
import { ReviewStoreState, ReviewWithUser, Review, ReviewStats, ReviewFilters, CreateReviewData, UpdateReviewData, ReviewResponse, ReviewFormState, ReviewModalState } from '../../interfaces/Review'

// Utility function to check if a review is within the 30-day editing window
const canEditReview = (review: Review): boolean => {
  if (!review.created_at) return false
  
  const createdDate = new Date(review.created_at)
  const currentDate = new Date()
  const daysDifference = (currentDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
  
  console.log('📝 ReviewStore: Checking edit eligibility for review:', review.id, {
    created_at: review.created_at,
    daysDifference: Math.round(daysDifference * 100) / 100,
    canEdit: daysDifference <= 30
  })
  
  return daysDifference <= 30
}

const initialFormState: ReviewFormState = {
  rating: 0,
  review_text: '',
  isSubmitting: false,
  errors: {}
}

const initialModalState: ReviewModalState = {
  isOpen: false,
  mode: 'create'
}

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  // Initial state
  reviews: [],
  currentReview: null,
  reviewStats: null,
  loading: false,
  error: null,
  modalState: initialModalState,
  formState: initialFormState,

  // Actions
  fetchPropertyReviews: async (propertyId: string, filters?: ReviewFilters) => {
    console.log('📝 ReviewStore: Fetching property reviews for:', propertyId, filters)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')

      const { data, error } = await supabase.rpc('get_public_property_reviews', {
        p_property_id: propertyId,
        p_limit: filters?.limit || 10,
        p_offset: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0
      })

      if (error) {
        console.error('📝 ReviewStore: Error fetching property reviews:', error)
        set({ loading: false, error: error.message })
        return
      }

      const response = data as ReviewResponse
      if (response.success) {
        set({
          reviews: response.reviews || [],
          reviewStats: response.stats || null,
          loading: false,
          error: null
        })
      } else {
        set({ loading: false, error: response.error || 'Failed to fetch reviews' })
      }
    } catch (error) {
      console.error('📝 ReviewStore: Exception fetching property reviews:', error)
      set({ loading: false, error: 'Failed to fetch reviews' })
    }
  },

  fetchUserReviews: async (userId: string, filters?: ReviewFilters) => {
    console.log('📝 ReviewStore: Fetching user reviews for:', userId, filters)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      const { data, error } = await supabase.rpc('get_user_reviews', {
        p_user_id: userId,
        p_limit: filters?.limit || 10,
        p_offset: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0
      })

      if (error) {
        console.error('📝 ReviewStore: Error fetching user reviews:', error)
        set({ loading: false, error: error.message })
        return
      }

      const response = data as ReviewResponse
      if (response.success) {
        set({
          reviews: response.reviews || [],
          reviewStats: response.stats || null,
          loading: false,
          error: null
        })
      } else {
        set({ loading: false, error: response.error || 'Failed to fetch reviews' })
      }
    } catch (error) {
      console.error('📝 ReviewStore: Exception fetching user reviews:', error)
      set({ loading: false, error: 'Failed to fetch reviews' })
    }
  },

  createReview: async (data: CreateReviewData): Promise<ReviewResponse> => {
    console.log('📝 ReviewStore: Creating review:', data)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      let result, error
      
      // Use public review function if no booking_id is provided
      if (!data.booking_id) {
        const { data: publicResult, error: publicError } = await supabase.rpc('create_public_review', {
          p_reviewer_id: data.reviewer_id,
          p_reviewed_user_id: data.reviewed_user_id,
          p_property_id: data.property_id,
          p_rating: data.rating,
          p_review_text: data.review_text,
          p_review_type: data.review_type
        })
        result = publicResult
        error = publicError
      } else {
        // Use regular review function for booking-based reviews
        const { data: bookingResult, error: bookingError } = await supabase.rpc('create_review', {
          p_booking_id: data.booking_id,
          p_reviewer_id: data.reviewer_id,
          p_reviewed_user_id: data.reviewed_user_id,
          p_property_id: data.property_id,
          p_rating: data.rating,
          p_review_text: data.review_text,
          p_review_type: data.review_type
        })
        result = bookingResult
        error = bookingError
      }

      if (error) {
        console.error('📝 ReviewStore: Error creating review:', error)
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      const response = result as ReviewResponse
      if (response.success) {
        set({ loading: false, error: null })
        // Refresh reviews if we have a property_id
        if (data.property_id) {
          get().fetchPropertyReviews(data.property_id)
        }
      } else {
        set({ loading: false, error: response.error || 'Failed to create review' })
      }

      return response
    } catch (error) {
      console.error('📝 ReviewStore: Exception creating review:', error)
      set({ loading: false, error: 'Failed to create review' })
      return { success: false, error: 'Failed to create review' }
    }
  },

  updateReview: async (reviewId: string, data: UpdateReviewData): Promise<ReviewResponse> => {
    console.log('📝 ReviewStore: Updating review:', reviewId, data)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      // First, get the current review to check if it's within the 30-day editing window
      const { data: currentReview, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (fetchError) {
        console.error('📝 ReviewStore: Error fetching review for validation:', fetchError)
        set({ loading: false, error: fetchError.message })
        return { success: false, error: fetchError.message }
      }

      // Check if the review is within the 30-day editing window
      if (!canEditReview(currentReview)) {
        const errorMessage = 'Reviews can only be edited within 30 days of creation'
        console.error('📝 ReviewStore: Review editing time limit exceeded:', errorMessage)
        set({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      const { data: result, error } = await supabase
        .from('reviews')
        .update({
          rating: data.rating,
          review_text: data.review_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) {
        console.error('📝 ReviewStore: Error updating review:', error)
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({ loading: false, error: null, currentReview: result })
      return { success: true, review: result }
    } catch (error) {
      console.error('📝 ReviewStore: Exception updating review:', error)
      set({ loading: false, error: 'Failed to update review' })
      return { success: false, error: 'Failed to update review' }
    }
  },

  deleteReview: async (reviewId: string, userId?: string): Promise<ReviewResponse> => {
    console.log('📝 ReviewStore: Deleting review:', reviewId, 'by user:', userId)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      // First, get the review to validate ownership
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (fetchError) {
        console.error('📝 ReviewStore: Error fetching review for deletion validation:', fetchError)
        set({ loading: false, error: fetchError.message })
        return { success: false, error: fetchError.message }
      }

      // Validate that the user owns the review
      if (userId && review.reviewer_id !== userId) {
        const errorMessage = 'You can only delete your own reviews'
        console.error('📝 ReviewStore: Unauthorized review deletion attempt:', errorMessage)
        set({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('📝 ReviewStore: Error deleting review:', error)
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({ loading: false, error: null, currentReview: null })
      return { success: true }
    } catch (error) {
      console.error('📝 ReviewStore: Exception deleting review:', error)
      set({ loading: false, error: 'Failed to delete review' })
      return { success: false, error: 'Failed to delete review' }
    }
  },

  openCreateModal: (bookingId: string, reviewType: string) => {
    console.log('📝 ReviewStore: Opening create modal for booking:', bookingId, 'type:', reviewType)
    set({
      modalState: {
        isOpen: true,
        bookingId,
        reviewType: reviewType as any,
        mode: 'create'
      },
      formState: initialFormState
    })
  },

  openEditModal: (reviewId: string) => {
    console.log('📝 ReviewStore: Opening edit modal for review:', reviewId)
    const review = get().reviews.find(r => r.id === reviewId)
    if (review) {
      set({
        modalState: {
          isOpen: true,
          reviewId,
          mode: 'edit'
        },
        formState: {
          rating: review.rating,
          review_text: review.review_text,
          isSubmitting: false,
          errors: {}
        },
        currentReview: review
      })
    }
  },

  openDeleteModal: (reviewId: string) => {
    console.log('📝 ReviewStore: Opening delete modal for review:', reviewId)
    set({
      modalState: {
        isOpen: true,
        reviewId,
        mode: 'delete'
      }
    })
  },

  closeModal: () => {
    console.log('📝 ReviewStore: Closing modal')
    set({
      modalState: initialModalState,
      formState: initialFormState,
      currentReview: null,
      error: null
    })
  },

  setFormState: (state: Partial<ReviewFormState>) => {
    set((prev) => ({
      formState: { ...prev.formState, ...state }
    }))
  },

  resetForm: () => {
    set({ formState: initialFormState })
  },

  clearError: () => {
    set({ error: null })
  },

  // Utility function to check if a review can be edited (exposed for components)
  canEditReview: (review: Review): boolean => {
    return canEditReview(review)
  },

  // Utility function to check if a user can delete a review
  canDeleteReview: (review: Review, userId?: string): boolean => {
    if (!userId) return false
    return review.reviewer_id === userId
  },

  // Check if a review already exists for a booking and review type
  checkExistingReview: async (bookingId: string, reviewType: string, reviewerId?: string): Promise<{
    exists: boolean
    review?: Review
    canReview?: boolean
    reason?: string
    error?: string
  }> => {
    console.log('📝 ReviewStore: Checking existing review:', { bookingId, reviewType, reviewerId })
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      const { data, error } = await supabase
        .rpc('check_existing_review', {
          p_booking_id: bookingId,
          p_review_type: reviewType,
          p_reviewer_id: reviewerId || null
        })

      if (error) {
        console.error('📝 ReviewStore: Error checking existing review:', error)
        set({ loading: false, error: error.message })
        return { exists: false, error: error.message }
      }

      console.log('📝 ReviewStore: Existing review check result:', data)
      set({ loading: false, error: null })

      if (data.exists) {
        // Review exists, fetch the full review details
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:reviewer_id(display_name, avatar_url),
            reviewed_user:reviewed_user_id(display_name, avatar_url)
          `)
          .eq('id', data.review_id)
          .single()

        if (reviewError) {
          console.error('📝 ReviewStore: Error fetching existing review:', reviewError)
          return { exists: true, error: reviewError.message }
        }

        return { 
          exists: true, 
          review: reviewData,
          canReview: data.can_edit
        }
      } else {
        return { 
          exists: false, 
          canReview: data.can_review,
          reason: data.reason
        }
      }
    } catch (error) {
      console.error('📝 ReviewStore: Exception checking existing review:', error)
      set({ loading: false, error: 'Failed to check existing review' })
      return { exists: false, error: 'Failed to check existing review' }
    }
  }
}))
