// Profile-related interfaces for the user profile page

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatarUrl?: string
  bio?: string
  dateOfBirth?: string
  location?: string
  joinDate: string
  lastUpdated: string
  isVerified: boolean
  preferences: ProfilePreferences
  privacySettings: PrivacySettings
  notificationSettings: NotificationSettings
}

export interface ProfilePreferences {
  language: string
  currency: string
  timezone: string
  theme: 'light' | 'dark' | 'auto'
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  allowDataSharing: boolean
  allowAnalytics: boolean
}

export interface NotificationSettings {
  emailNotifications: {
    bookingUpdates: boolean
    newMessages: boolean
    propertyApprovals: boolean
    paymentConfirmations: boolean
    marketing: boolean
  }
  pushNotifications: {
    bookingUpdates: boolean
    newMessages: boolean
    propertyApprovals: boolean
    paymentConfirmations: boolean
    marketing: boolean
  }
  smsNotifications: {
    bookingUpdates: boolean
    paymentConfirmations: boolean
  }
}

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  dateOfBirth?: string
  location?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileImageData {
  file: File
  previewUrl: string
  croppedData?: string
}

export interface ProfileFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bio?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface ProfilePageProps {
  onProfileUpdate?: (profile: Profile) => void
  onPasswordChange?: () => void
  onImageUpload?: (imageData: ProfileImageData) => void
}
