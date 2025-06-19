// Notification-related interfaces

export interface Notification {
  id: string
  type: 'booking' | 'like' | 'review' | 'message' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  avatar?: string
  propertyImage?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'push' | 'sms'
  status: 'active' | 'draft'
  lastModified: string
} 