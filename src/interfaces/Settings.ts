export interface PlatformSettings {
  siteName?: string
  siteDescription?: string
  contactEmail?: string
  supportEmail?: string
  defaultLanguage?: string
  timezone?: string
  maintenanceMode?: boolean
  registrationEnabled?: boolean
  maxFileSize?: number
  allowedImageFormats?: string[]
  allowedVideoFormats?: string[]
}

export interface BookingSettings {
  commissionRate?: number
  paymentProcessingFee?: number
  maxAdvanceBooking?: number
  minAdvanceBooking?: number
  cancellationGracePeriod?: number
  hostPayoutDelay?: number
  minimumStay?: number
  maximumStay?: number
  autoApprovalEnabled?: boolean
  instantBookingEnabled?: boolean
}

export interface NotificationSettings {
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  bookingConfirmations?: boolean
  paymentNotifications?: boolean
  disputeAlerts?: boolean
  systemAlerts?: boolean
  marketingEmails?: boolean
  weeklyReports?: boolean
}

export interface SecuritySettings {
  passwordMinLength?: number
  sessionTimeout?: number
  maxLoginAttempts?: number
  apiRateLimit?: number
  twoFactorRequired?: boolean
  passwordRequireSpecialChars?: boolean
  enableAuditLog?: boolean
  encryptUserData?: boolean
  ipWhitelist?: string
  dataRetentionPeriod?: number
}

export interface PaymentSettings {
  stripePublicKey?: string
  stripeSecretKey?: string
  paypalClientId?: string
  paypalClientSecret?: string
  defaultCurrency?: string
  payoutSchedule?: string
  minimumPayoutAmount?: number
  taxRate?: number
  autoPayoutEnabled?: boolean
  chargeTaxes?: boolean
}

export interface AdminSettings {
  platform?: PlatformSettings
  booking?: BookingSettings
  notification?: NotificationSettings
  security?: SecuritySettings
  payment?: PaymentSettings
}

export interface AdminSettingRecord {
  id: string
  category: 'general' | 'booking' | 'payment' | 'notifications' | 'security' | 'content'
  setting_key: string
  setting_value: any
  data_type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  is_encrypted?: boolean
  is_system_setting?: boolean
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
} 