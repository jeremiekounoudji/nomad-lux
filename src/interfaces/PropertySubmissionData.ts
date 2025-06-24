import { HostSubmissionData } from './User'

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
} 