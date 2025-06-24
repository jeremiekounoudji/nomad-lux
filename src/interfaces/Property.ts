// Property-related interfaces

import { User, HostSubmissionData } from './User'

// Simplified host interface for property listings
export interface PropertyHost {
  id: string
  name: string
  username: string
  avatar: string
  isVerified: boolean
  email: string
  phone: string
  rating: number
  responseRate: number
  responseTime: string
}

export interface Property {
  id: string
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
  images: string[]
  videos?: string[]
  host: PropertyHost
  rating: number
  reviewCount: number
  propertyType: string
  amenities: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  isLiked: boolean
  distance?: string
  createdAt: string
  cleaningFee?: number
  serviceFee?: number
  totalBeforeTaxes?: number
}

// Admin property interface
export interface AdminProperty {
  id: string
  title: string
  description: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  price: number
  images: string[]
  video?: string
  host: {
    name: string
    email: string
    rating: number
    joinDate: string
  }
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected'
  amenities: string[]
  propertyType: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
}

// Property submission data type - allows File objects during submission
export type PropertySubmissionData = Omit<
  Property,
  'id' | 'rating' | 'reviewCount' | 'isLiked' | 'distance' | 'createdAt' | 'totalBeforeTaxes' | 'host' | 'images' | 'videos'
> & {
  host: HostSubmissionData;
  images: (File | string)[]; // Allow both File objects and URLs
  videos?: (File | string)[]; // Allow both File objects and URLs
};

export interface PopularPlace {
  id: string
  name: string
  image: string
  propertyCount: number
  country: string
}

export interface ListingStats {
  views: number
  bookings: number
  revenue: number
  rating: number
  status: 'active' | 'pending' | 'paused' | 'rejected'
}

export interface TopProperty {
  id: string
  title: string
  image: string
  location: string
  revenue: number     
  bookings: number
  rating: number
  host: string
} 