import { create } from 'zustand'
import { ReviewStoreState, Review, ReviewFilters, CreateReviewData, UpdateReviewData, ReviewResponse, ReviewFormState, ReviewModalState } from '../../interfaces/Review'

// Utility function to check if a review is within the 30-day editing window
const canEditReview = (review: Review): boolean => {
  if (!review.created_at) return false
  
  const createdDate = new Date(review.created_at)
  const currentDate = new Date()
  const daysDifference = (currentDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
  

  
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
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')

      // Use direct query instead of RPC function due to database issues
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id(display_name, avatar_url)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .range(
          filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
          (filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0) + (filters?.limit || 10) - 1
        )

      if (reviewsError) {
        set({ loading: false, error: reviewsError.message })
        return
      }

      // Get stats
      const { data: statsData, error: statsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('property_id', propertyId)

      if (statsError) {
        set({ loading: false, error: statsError.message })
        return
      }

      // Calculate stats
      const totalReviews = statsData.length
      const averageRating = totalReviews > 0 
        ? statsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0

      const ratingDistribution = {
        1: statsData.filter(r => r.rating === 1).length,
        2: statsData.filter(r => r.rating === 2).length,
        3: statsData.filter(r => r.rating === 3).length,
        4: statsData.filter(r => r.rating === 4).length,
        5: statsData.filter(r => r.rating === 5).length
      }

      const reviewStats = {
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingDistribution
      }

      // Transform reviews to match expected format
      const transformedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        review_type: review.review_type,
        created_at: review.created_at,
        updated_at: review.updated_at,
        reviewer_id: review.reviewer_id,
        reviewer_name: review.reviewer?.display_name || 'Anonymous',
        reviewer_avatar: review.reviewer?.avatar_url,
        property_id: review.property_id
      }))

      set({
        reviews: transformedReviews,
        reviewStats: reviewStats,
        loading: false,
        error: null
      })
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch reviews' })
    }
  },

  fetchUserReviews: async (userId: string, filters?: ReviewFilters) => {
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      // Use direct query instead of RPC function
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id(display_name, avatar_url),
          property:property_id(title)
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false })
        .range(
          filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
          (filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0) + (filters?.limit || 10) - 1
        )

      if (reviewsError) {
        set({ loading: false, error: reviewsError.message })
        return
      }

      // Get stats
      const { data: statsData, error: statsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', userId)

      if (statsError) {
        set({ loading: false, error: statsError.message })
        return
      }

      // Calculate stats
      const totalReviews = statsData.length
      const averageRating = totalReviews > 0 
        ? statsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0

      const ratingDistribution = {
        1: statsData.filter(r => r.rating === 1).length,
        2: statsData.filter(r => r.rating === 2).length,
        3: statsData.filter(r => r.rating === 3).length,
        4: statsData.filter(r => r.rating === 4).length,
        5: statsData.filter(r => r.rating === 5).length
      }

      const reviewStats = {
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingDistribution
      }

      // Transform reviews to match expected format
      const transformedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        review_type: review.review_type,
        created_at: review.created_at,
        updated_at: review.updated_at,
        reviewer_id: review.reviewer_id,
        reviewer_name: review.reviewer?.display_name || 'Anonymous',
        reviewer_avatar: review.reviewer?.avatar_url,
        property_id: review.property_id,
        property_title: review.property?.title
      }))

      set({
        reviews: transformedReviews,
        reviewStats: reviewStats,
        loading: false,
        error: null
      })
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch reviews' })
    }
  },

  createReview: async (data: CreateReviewData): Promise<ReviewResponse> => {
    set({ loading: true, error: null })

    try {
      const { supabase } = await import('../supabase')
      
      // Use direct insert instead of RPC function
      const { data: result, error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: data.reviewer_id,
          reviewed_user_id: data.reviewed_user_id,
          property_id: data.property_id,
          rating: data.rating,
          review_text: data.review_text,
          review_type: data.review_type
        })
        .select()
        .single()

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({ loading: false, error: null })
      // Refresh reviews if we have a property_id
      if (data.property_id) {
        get().fetchPropertyReviews(data.property_id)
      }

      return { success: true, review: result }
    } catch (error) {
      set({ loading: false, error: 'Failed to create review' })
      return { success: false, error: 'Failed to create review' }
    }
  },

  updateReview: async (reviewId: string, data: UpdateReviewData): Promise<ReviewResponse> => {
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
        set({ loading: false, error: fetchError.message })
        return { success: false, error: fetchError.message }
      }

      // Check if the review is within the 30-day editing window
      if (!canEditReview(currentReview)) {
        const errorMessage = 'Reviews can only be edited within 30 days of creation'
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
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({ loading: false, error: null, currentReview: result })
      return { success: true, review: result }
    } catch (error) {
      set({ loading: false, error: 'Failed to update review' })
      return { success: false, error: 'Failed to update review' }
    }
  },

  deleteReview: async (reviewId: string, userId?: string): Promise<ReviewResponse> => {
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
        set({ loading: false, error: fetchError.message })
        return { success: false, error: fetchError.message }
      }

      // Validate that the user owns the review
      if (userId && review.reviewer_id !== userId) {
        const errorMessage = 'You can only delete your own reviews'
        set({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({ loading: false, error: null, currentReview: null })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: 'Failed to delete review' })
      return { success: false, error: 'Failed to delete review' }
    }
  },

  openCreateModal: (reviewType: string) => {
    set({
      modalState: {
        isOpen: true,
        reviewType: reviewType as any,
        mode: 'create'
      },
      formState: initialFormState
    })
  },

  openEditModal: (reviewId: string) => {
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
    set({
      modalState: {
        isOpen: true,
        reviewId,
        mode: 'delete'
      }
    })
  },

  closeModal: () => {
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

  // Check if a review already exists for a review type (simplified for public reviews)
  checkExistingReview: async (/*reviewType: string, reviewerId?: string*/): Promise<{
    exists: boolean
    review?: Review
    canReview?: boolean
    reason?: string
    error?: string
  }> => {
    set({ loading: true, error: null })

    try {
      // For public reviews, we don't need to check for existing reviews
      // Anyone can review anything
      set({ loading: false, error: null })
      
      return { 
        exists: false, 
        canReview: true,
        reason: 'Public reviews are always allowed'
      }
    } catch (error) {
      set({ loading: false, error: 'Failed to check existing review' })
      return { exists: false, error: 'Failed to check existing review' }
    }
  }
}))
