import { HostSubmissionData } from './User'
import { PropertySettingsFormData } from './PropertySettings'

export interface PropertySubmissionData {
  title: string
  description: string
  price: number
  currency: string
  location: {
    city: string
    country: string
    address?: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: (File | string)[]
  videos?: (File | string)[]
  property_type: string
  amenities: string[]
  max_guests: number
  bedrooms: number
  bathrooms: number
  cleaning_fee: number
  service_fee: number
  instant_book: boolean
  additional_fees: any[]
  host: HostSubmissionData
  is_liked?: boolean
  
  // NEW: Property settings (settings-first workflow)
  property_settings?: PropertySettingsFormData
  existing_settings_id?: string // Reference to existing settings
  create_new_settings?: boolean // Whether to create new settings or use existing
} 