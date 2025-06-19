// Admin-specific interfaces

export interface MessageData {
  subject: string
  message: string
  type: 'info' | 'warning' | 'urgent'
  sendToAll: boolean
  specificUsers?: string[]
  scheduledDate?: string
} 