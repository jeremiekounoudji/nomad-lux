export interface Review {
  id: string
  reviewer_id: string
  reviewed_user_id?: string
  property_id: string
  rating: number
  review_text: string
  review_type: ReviewType
  created_at: string
  updated_at: string
}

export type ReviewType = 'guest_to_host' | 'host_to_guest' | 'property'

export interface ReviewWithUser extends Review {
  reviewer_name: string
  reviewer_avatar?: string
  reviewer_display_name?: string
}

export interface ReviewWithProperty extends ReviewWithUser {
  property_title?: string
  property_image?: string
}

export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    [key: number]: number // 1-5 stars count
  }
}

export interface ReviewFilters {
  rating?: number
  review_type?: ReviewType
  sort_by?: 'newest' | 'oldest' | 'rating_high' | 'rating_low'
  page?: number
  limit?: number
}

export interface CreateReviewData {
  reviewer_id: string
  reviewed_user_id?: string
  property_id: string
  rating: number
  review_text: string
  review_type: ReviewType
}

export interface UpdateReviewData {
  rating?: number
  review_text?: string
}

export interface ReviewResponse {
  success: boolean
  review?: Review
  reviews?: ReviewWithUser[]
  stats?: ReviewStats
  error?: string
  total_count?: number
  average_rating?: number
  limit?: number
  offset?: number
}

export interface ReviewValidation {
  isValid: boolean
  errors: {
    rating?: string
    review_text?: string
    booking?: string
    general?: string
  }
}

export interface ReviewFormState {
  rating: number
  review_text: string
  isSubmitting: boolean
  errors: ReviewValidation['errors']
}

export interface ReviewModalState {
  isOpen: boolean
  reviewId?: string
  reviewType?: ReviewType
  mode: 'create' | 'edit' | 'delete'
}

export interface ReviewListState {
  reviews: ReviewWithUser[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  totalCount: number
  averageRating: number
}

export interface ReviewStoreState {
  // State
  reviews: ReviewWithUser[]
  currentReview: Review | null
  reviewStats: ReviewStats | null
  loading: boolean
  error: string | null
  modalState: ReviewModalState
  formState: ReviewFormState
  
  // Actions
  fetchPropertyReviews: (propertyId: string, filters?: ReviewFilters) => Promise<void>
  fetchUserReviews: (userId: string, filters?: ReviewFilters) => Promise<void>
  createReview: (data: CreateReviewData) => Promise<ReviewResponse>
  updateReview: (reviewId: string, data: UpdateReviewData) => Promise<ReviewResponse>
  deleteReview: (reviewId: string, userId?: string) => Promise<ReviewResponse>
  openCreateModal: (reviewType: ReviewType) => void
  openEditModal: (reviewId: string) => void
  openDeleteModal: (reviewId: string) => void
  closeModal: () => void
  setFormState: (state: Partial<ReviewFormState>) => void
  resetForm: () => void
  clearError: () => void
  canEditReview: (review: Review) => boolean
  canDeleteReview: (review: Review, userId?: string) => boolean
  checkExistingReview: (reviewType: string, reviewerId?: string) => Promise<{
    exists: boolean
    review?: Review
    canReview?: boolean
    reason?: string
    error?: string
  }>
}
