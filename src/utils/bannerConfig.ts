// Banner configuration for consistent image management across pages

export interface BannerConfig {
  image: string
  alt: string
  overlayOpacity: 'light' | 'medium' | 'dark'
  height: 'small' | 'medium' | 'large'
}

export const BANNER_CONFIGS: Record<string, BannerConfig> = {
  notifications: {
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80',
    alt: 'Notifications and alerts background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  createProperty: {
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern house architecture background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  myListings: {
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
    alt: 'Property management background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  myBookings: {
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    alt: 'Travel and booking background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  likedProperties: {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Favorite properties background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  bookingRequests: {
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    alt: 'Communication and requests background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  search: {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Property search and discovery background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  home: {
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    alt: 'Luxury property discovery background',
    overlayOpacity: 'medium',
    height: 'large'
  },
  wallet: {
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    alt: 'Financial and wallet management background',
    overlayOpacity: 'medium',
    height: 'medium'
  },
  admin: {
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    alt: 'Admin dashboard and management background',
    overlayOpacity: 'dark',
    height: 'medium'
  }
}

// Helper function to get banner config
export const getBannerConfig = (pageKey: string): BannerConfig => {
  return BANNER_CONFIGS[pageKey] || BANNER_CONFIGS.home
}