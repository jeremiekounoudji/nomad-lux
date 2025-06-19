// Mock data for Nomad Lux frontend

import { User, Property, PopularPlace } from '../interfaces'

// Mock Users (using proper database schema format)
export const mockUsers: User[] = [
  {
    id: '1',
    auth_id: 'auth_1',
    email: 'sarah.johnson@example.com',
    display_name: 'Sarah Johnson',
    username: 'sarahj_travels',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0101',
    bio: 'Luxury property host | Travel enthusiast',
    location: 'Los Angeles, CA',
    
    // Verification status
    is_phone_verified: true,
    is_email_verified: true,
    is_identity_verified: true,
    
    // User role and status
    user_role: 'host',
    account_status: 'active',
    
    // Host specific fields
    is_host: true,
    host_since: '2022-01-15',
    response_rate: 95,
    response_time: 'within an hour',
    
    // Ratings and statistics
    guest_rating: 4.8,
    host_rating: 4.9,
    total_guest_reviews: 45,
    total_host_reviews: 127,
    total_bookings: 89,
    total_properties: 3,
    total_revenue: 45000,
    
    // Preferences
    preferred_currency: 'USD',
    language_preference: 'en',
    timezone: 'America/Los_Angeles',
    
    // Activity tracking
    last_login: '2024-01-20T10:30:00Z',
    created_at: '2022-01-15T08:00:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    auth_id: 'auth_2',
    email: 'michael.chen@example.com',
    display_name: 'Michael Chen',
    username: 'mike_properties',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0102',
    bio: 'Boutique hotel owner',
    location: 'San Francisco, CA',
    
    // Verification status
    is_phone_verified: true,
    is_email_verified: true,
    is_identity_verified: true,
    
    // User role and status
    user_role: 'host',
    account_status: 'active',
    
    // Host specific fields
    is_host: true,
    host_since: '2021-06-10',
    response_rate: 98,
    response_time: 'within a few hours',
    
    // Ratings and statistics
    guest_rating: 4.7,
    host_rating: 4.8,
    total_guest_reviews: 23,
    total_host_reviews: 89,
    total_bookings: 67,
    total_properties: 2,
    total_revenue: 32000,
    
    // Preferences
    preferred_currency: 'USD',
    language_preference: 'en',
    timezone: 'America/Los_Angeles',
    
    // Activity tracking
    last_login: '2024-01-19T15:45:00Z',
    created_at: '2021-06-10T12:00:00Z',
    updated_at: '2024-01-19T15:45:00Z'
  },
  {
    id: '3',
    auth_id: 'auth_3',
    email: 'emma.rodriguez@example.com',
    display_name: 'Emma Rodriguez',
    username: 'emma_homes',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0103',
    bio: 'Cozy homes specialist',
    location: 'Miami, FL',
    
    // Verification status
    is_phone_verified: false,
    is_email_verified: true,
    is_identity_verified: false,
    
    // User role and status
    user_role: 'host',
    account_status: 'active',
    
    // Host specific fields
    is_host: true,
    host_since: '2023-03-20',
    response_rate: 88,
    response_time: 'within a day',
    
    // Ratings and statistics
    guest_rating: 4.5,
    host_rating: 4.6,
    total_guest_reviews: 12,
    total_host_reviews: 34,
    total_bookings: 28,
    total_properties: 1,
    total_revenue: 8500,
    
    // Preferences
    preferred_currency: 'USD',
    language_preference: 'en',
    timezone: 'America/New_York',
    
    // Activity tracking
    last_login: '2024-01-18T09:20:00Z',
    created_at: '2023-03-20T14:30:00Z',
    updated_at: '2024-01-18T09:20:00Z'
  },
  {
    id: '4',
    auth_id: 'auth_4',
    email: 'david.kim@example.com',
    display_name: 'David Kim',
    username: 'david_luxury',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0104',
    bio: 'Luxury villa curator',
    location: 'New York, NY',
    
    // Verification status
    is_phone_verified: true,
    is_email_verified: true,
    is_identity_verified: true,
    
    // User role and status
    user_role: 'host',
    account_status: 'active',
    
    // Host specific fields
    is_host: true,
    host_since: '2020-11-05',
    response_rate: 99,
    response_time: 'within an hour',
    
    // Ratings and statistics
    guest_rating: 4.9,
    host_rating: 4.9,
    total_guest_reviews: 78,
    total_host_reviews: 156,
    total_bookings: 145,
    total_properties: 4,
    total_revenue: 78000,
    
    // Preferences
    preferred_currency: 'USD',
    language_preference: 'en',
    timezone: 'America/New_York',
    
    // Activity tracking
    last_login: '2024-01-20T16:15:00Z',
    created_at: '2020-11-05T10:00:00Z',
    updated_at: '2024-01-20T16:15:00Z'
  }
]

// Mock current user for testing (will be replaced by real auth)
export const mockCurrentUser: User = mockUsers[0]

// Mock Popular Places
export const mockPopularPlaces: PopularPlace[] = [
  {
    id: '1',
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
    propertyCount: 1247,
    country: 'Indonesia'
  },
  {
    id: '2',
    name: 'Santorini',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
    propertyCount: 892,
    country: 'Greece'
  },
  {
    id: '3',
    name: 'Maldives',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    propertyCount: 456,
    country: 'Maldives'
  },
  {
    id: '4',
    name: 'Tuscany',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=300&fit=crop',
    propertyCount: 678,
    country: 'Italy'
  },
  {
    id: '5',
    name: 'Tulum',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop',
    propertyCount: 334,
    country: 'Mexico'
  },
  {
    id: '6',
    name: 'Mykonos',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
    propertyCount: 567,
    country: 'Greece'
  }
]

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Beachfront Villa with Infinity Pool',
    description: 'Wake up to stunning ocean views in this modern beachfront villa. Features include infinity pool, private beach access, and world-class amenities.',
    price: 450,
    currency: 'USD',
    location: {
      city: 'Seminyak',
      country: 'Bali, Indonesia',
      coordinates: { lat: -8.6905, lng: 115.1729 }
    },
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
    ],
    host: mockUsers[0],
    rating: 4.9,
    reviewCount: 127,
    propertyType: 'Villa',
    amenities: ['Pool', 'Beach Access', 'WiFi', 'Kitchen', 'Parking'],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    isLiked: true,
    distance: '2.3 km away',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Cozy Mountain Cabin with Fireplace',
    description: 'Escape to this charming mountain retreat perfect for a romantic getaway or family vacation. Features fireplace, hot tub, and hiking trails nearby.',
    price: 180,
    currency: 'USD',
    location: {
      city: 'Aspen',
      country: 'Colorado, USA',
      coordinates: { lat: 39.1911, lng: -106.8175 }
    },
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
    ],
    host: mockUsers[1],
    rating: 4.7,
    reviewCount: 89,
    propertyType: 'Cabin',
    amenities: ['Fireplace', 'Hot Tub', 'WiFi', 'Kitchen', 'Hiking'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    isLiked: false,
    distance: '5.1 km away',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Modern City Loft in Downtown',
    description: 'Stylish loft apartment in the heart of the city. Walking distance to restaurants, shops, and nightlife. Perfect for business travelers.',
    price: 220,
    currency: 'USD',
    location: {
      city: 'New York',
      country: 'New York, USA',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
    ],
    host: mockUsers[2],
    rating: 4.6,
    reviewCount: 203,
    propertyType: 'Loft',
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Rooftop', 'Concierge'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    isLiked: true,
    distance: '1.8 km away',
    createdAt: '2024-01-25'
  },
  {
    id: '4',
    title: 'Oceanfront Penthouse with Panoramic Views',
    description: 'Breathtaking penthouse with 360-degree ocean views. Features private terrace, jacuzzi, and premium furnishings throughout.',
    price: 680,
    currency: 'USD',
    location: {
      city: 'Santorini',
      country: 'Greece',
      coordinates: { lat: 36.3932, lng: 25.4615 }
    },
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ],
    host: mockUsers[3],
    rating: 4.8,
    reviewCount: 156,
    propertyType: 'Penthouse',
    amenities: ['Ocean View', 'Jacuzzi', 'WiFi', 'Kitchen', 'Terrace'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    isLiked: false,
    distance: '3.7 km away',
    createdAt: '2024-02-01'
  },
  {
    id: '5',
    title: 'Rustic Farmhouse with Vineyard Views',
    description: 'Charming farmhouse surrounded by rolling vineyards. Perfect for wine lovers with private tastings and farm-to-table dining experiences.',
    price: 320,
    currency: 'USD',
    location: {
      city: 'Tuscany',
      country: 'Italy',
      coordinates: { lat: 43.7711, lng: 11.2486 }
    },
    images: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    host: mockUsers[0],
    rating: 4.9,
    reviewCount: 94,
    propertyType: 'Farmhouse',
    amenities: ['Vineyard', 'Wine Tasting', 'WiFi', 'Kitchen', 'Garden'],
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    isLiked: true,
    distance: '12.5 km away',
    createdAt: '2024-02-05'
  },
  {
    id: '6',
    title: 'Tropical Overwater Bungalow',
    description: 'Experience paradise in this overwater bungalow with direct lagoon access. Includes glass floor panels and private deck for snorkeling.',
    price: 890,
    currency: 'USD',
    location: {
      city: 'Bora Bora',
      country: 'French Polynesia',
      coordinates: { lat: -16.5004, lng: -151.7415 }
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
    ],
    host: mockUsers[1],
    rating: 5.0,
    reviewCount: 78,
    propertyType: 'Bungalow',
    amenities: ['Overwater', 'Snorkeling', 'WiFi', 'Breakfast', 'Spa'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    isLiked: false,
    distance: '0.5 km away',
    createdAt: '2024-02-10'
  }
] 