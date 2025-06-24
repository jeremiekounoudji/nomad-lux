// Component prop interfaces

// Page component props
export interface SearchPageProps {
  onPageChange?: (page: string) => void
}

export interface RegisterPageProps {
  onPageChange?: (page: string) => void
  onRegister?: () => void
}

export interface PropertyDetailPageProps {
  property: import('./Property').Property
  onBack: () => void
}

export interface NotificationsPageProps {
  onPageChange?: (page: string) => void
}

export interface MyListingsPageProps {
  onPageChange?: (page: string) => void
}

export interface MyBookingsPageProps {
  onPageChange?: (page: string) => void
}

export interface LoginPageProps {
  onPageChange?: (page: string) => void
  onLogin?: () => void
}

export interface LikedPropertiesPageProps {
  onPageChange?: (page: string) => void
}

export interface CreatePropertyPageProps {
  onPageChange?: (page: string) => void
}

export interface BookingRequestsPageProps {
  onPageChange?: (page: string) => void
}

export interface AdminRegisterPageProps {
  onPageChange?: (page: string) => void
}

export interface AdminPageProps {
  onPageChange?: (page: string) => void
}

export interface AdminLoginPageProps {
  onPageChange?: (page: string) => void
}

// Layout component props
export interface MainLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onPageChange?: (page: string) => void
}

export interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

// Shared component props
export interface PropertyCardProps {
  property: import('./Property').Property
  variant?: 'feed' | 'grid' | 'list'
  onLike?: (propertyId: string) => void
  onShare?: (property: import('./Property').Property) => void
  onBook?: (property: import('./Property').Property) => void
  onClick?: (property: import('./Property').Property) => void
}

export interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: import('./User').User
  onEditProfile?: () => void
  onLogout?: () => void
}

export interface PopularPlacesProps {
  places?: import('./Property').PopularPlace[]
}

// Property form step props
export interface PropertyDetailsStepProps {
  formData: import('./PropertySubmissionData').PropertySubmissionData
  setFormData: (data: import('./PropertySubmissionData').PropertySubmissionData) => void
}

export interface MediaUploadStepProps {
  formData: import('./PropertySubmissionData').PropertySubmissionData
  setFormData: (data: import('./PropertySubmissionData').PropertySubmissionData) => void
}

export interface HostDetailsStepProps {
  formData: import('./PropertySubmissionData').PropertySubmissionData
  setFormData: (data: import('./PropertySubmissionData').PropertySubmissionData) => void
}

export interface PropertySubmissionFormProps {
  initialData?: import('./Property').Property
  isEditMode?: boolean
  onSubmitSuccess?: (propertyData: any) => void
  onCancel?: () => void
  externalLoading?: boolean
}

// Admin component props
export interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onPageChange?: (page: string) => void
}

export interface AdminSidebarProps {
  currentPage?: string
  onPageChange?: (page: string) => void
}

export interface AdminHeaderProps {
  onPageChange?: (page: string) => void
}

export interface AdminStatsProps {
  onPageChange?: (page: string) => void
}

export interface AdminDashboardProps {
  onPageChange?: (page: string) => void
}

export interface AnalyticsDashboardProps {
  onPageChange: (page: string) => void
}

export interface ActivityLogProps {
  onPageChange?: (page: string) => void
}

export interface PropertyApprovalProps {
  onPageChange?: (page: string) => void
}

export interface BookingManagementProps {
  onPageChange?: (page: string) => void
}

// Admin modal props
export interface PropertyApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').AdminProperty
  onApprove: (propertyId: string) => void
  onReject: (propertyId: string, reason: string) => void
}

export interface PropertyRejectionModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').AdminProperty
  onReject: (propertyId: string, reason: string) => void
}

export interface PropertySuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').AdminProperty
  onSuspend: (propertyId: string, reason: string) => void
}

export interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: import('./Booking').AdminBooking
}

export interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  booking: import('./Booking').AdminBooking
  onRefund: (bookingId: string, amount: number, reason: string) => void
}

export interface UserActivationModalProps {
  isOpen: boolean
  onClose: () => void
  user: import('./User').AdminUser
  onActivate: (userId: string) => void
}

export interface UserSuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  user: import('./User').AdminUser
  onSuspend: (userId: string, reason: string, duration: string) => void
}

export interface UserDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  user: import('./User').AdminUser
  onDelete: (userId: string, reason: string) => void
}

export interface BulkUserActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: import('./User').AdminUser[]
  onBulkAction: (action: string, userIds: string[]) => void
}

export interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipient?: import('./User').AdminUser
  onSend: (messageData: import('./Admin').MessageData) => void
}

export interface ContactPartiesModalProps {
  isOpen: boolean
  onClose: () => void
  booking: import('./Booking').AdminBooking
  onSendMessage: (recipients: string[], message: string) => void
}

export interface DisputeManagementModalProps {
  isOpen: boolean
  onClose: () => void
  dispute: import('./Booking').Dispute
  onResolve: (disputeId: string, resolution: string) => void
}

// User-side modal props
export interface BookPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').Property
  onBookingConfirm: (bookingData: {
    checkIn: string
    checkOut: string
    guests: number
    totalPrice: number
    specialRequests?: string
  }) => void
}

export interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: import('./Booking').Booking
  onConfirmCancel: (reason: string) => void
}

export interface PropertyStatsModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').Property
  stats: import('./Property').ListingStats
}

export interface ContactHostModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').Property
  onSendMessage: (message: string) => void
}

export interface SharePropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').Property
}

export interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: import('./User').User
  onSave: (userData: Partial<import('./User').User>) => void
}

export interface SearchFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: {
    priceRange: [number, number]
    propertyType: string[]
    amenities: string[]
    guests: number
    bedrooms: number
    bathrooms: number
    location: string
  }) => void
}

export interface NotificationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  notification: import('./Notification').Notification
  onMarkAsRead?: () => void
}

export interface PropertyQuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  property: import('./Property').Property
  onBookNow?: () => void
  onLike?: () => void
}

// Pagination component props
export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  className?: string
}

// Skeleton component props
export interface PropertyListingSkeletonProps {
  count?: number
  className?: string
}

export interface HeaderSkeletonProps {
  className?: string
}

export interface TabsSkeletonProps {
  className?: string
} 