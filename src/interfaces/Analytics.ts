// Analytics-related interfaces

export interface MetricCard {
  title: string
  value: string | number
  change: number
  period: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger'
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TopHost {
  id: string
  name: string
  avatar: string
  properties: number
  revenue: number
  rating: number
  responseRate: number
}

export interface Activity {
  id: string
  type: 'booking' | 'registration' | 'property_submission' | 'payment' | 'review' | 'cancellation'
  user: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
  details: string
  amount?: number
  propertyId?: string
}

export interface SettingChange {
  id: string
  setting: string
  oldValue: string
  newValue: string
  changedBy: string
  timestamp: string
  description: string
} 