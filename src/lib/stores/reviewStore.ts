import { create } from 'zustand'
import { ReviewStoreState, ReviewWithUser, Review, ReviewStats, ReviewFilters, CreateReviewData, UpdateReviewData, ReviewResponse, ReviewFormState, ReviewModalState } from '../../interfaces/Review'

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
      
      const params = new URLSearchParams()
      if (filters?.rating) params.append('rating', filters.rating.toString())
      if (filters?.review_type) params.append('review_type', filters.review_type)
      if (filters?.sort_by) params.append('sort_by', filters.sort_by)
      if (filters?.page) params.append('offset', ((filters.page - 1) * (filters.limit || 10)).toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const { data, error } = await supabase.rpc('get_property_reviews', {
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
      
      const { data: result, error } = await supabase.rpc('create_review', {
        p_booking_id: data.booking_id,
        p_reviewer_id: data.reviewer_id,
        p_reviewed_user_id: data.reviewed_user_id,
        p_property_id: data.property_id,
        p_rating: data.rating,
        p_review_text: data.review_text,
        p_review_type: data.review_type
      })

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

  deleteReview: async (reviewId: string): Promise<ReviewResponse> => {
    console.log('📝 ReviewStore: Deleting review:', reviewId)
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
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
  }
}))
