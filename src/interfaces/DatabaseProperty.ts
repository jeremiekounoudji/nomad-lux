export interface DatabaseProperty {
  id: string
  title: string
  description: string
  price_per_night: number
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
  images: string[]
  video?: string
  host_id: string
  property_type: string
  amenities: string[]
  max_guests: number
  bedrooms: number
  bathrooms: number
  cleaning_fee: number
  service_fee: number
  rating: number
  review_count: number
  view_count: number
  booking_count: number
  total_revenue: number
  created_at: string
  updated_at: string
  status: string
} 