// Central interfaces export file
// Export all interface categories

export * from './User'
export * from './Property'
export * from './PropertySubmissionData'
export * from './PropertySettings'
export * from './PaymentRecord'
export * from './Booking'
export * from './Admin'
export * from './Component'
export * from './Notification'
export * from './Analytics'
export * from './Auth'
export * from './DatabaseProperty'
export * from './ListingStats'
export * from './PropertyCardProps'
export * from './Settings'
export * from './PayoutRequest'
export * from './Map'

// Pagination interfaces
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationData
} 