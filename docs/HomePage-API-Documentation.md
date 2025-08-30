# 🏠 HomePage API Documentation - Nomad Lux

## Overview
This document outlines the API endpoints and functionality for the HomePage property feed and popular places section in the Nomad Lux platform. The implementation uses Supabase RPC functions for efficient data fetching with advanced filtering and pagination. The implementation uses Supabase RPC functions for efficient data fetching with advanced filtering and pagination.

---

## 🌟 Popular Places Section

### Purpose
Display trending destinations with property counts to inspire user exploration.

### API Function: `get_popular_places(limit_count)`

#### Database Implementation
```sql
CREATE OR REPLACE FUNCTION get_popular_places(
    limit_count INTEGER DEFAULT 6
)
RETURNS JSON AS $$
DECLARE
    popular_places JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', city_stats.city_id,
            'name', city_stats.city_name,
            'country', city_stats.country,
            'property_count', city_stats.property_count,
            'average_price', ROUND(city_stats.avg_price::numeric, 2),
            'featured_image', city_stats.featured_image,
            'coordinates', json_build_object(
                'lat', city_stats.avg_lat,
                'lng', city_stats.avg_lng
            )
        ) ORDER BY city_stats.property_count DESC, city_stats.avg_price ASC
    ) INTO popular_places
    FROM (
        SELECT 
            CONCAT(LOWER(REPLACE((location->>'city'), ' ', '-')), '-', 
                   LOWER(REPLACE((location->>'country'), ' ', '-'))) as city_id,
            (location->>'city') as city_name,
            (location->>'country') as country,
            COUNT(*) as property_count,
            AVG(price_per_night) as avg_price,
            AVG((location->'coordinates'->>'lat')::decimal) as avg_lat,
            AVG((location->'coordinates'->>'lng')::decimal) as avg_lng,
            (
                SELECT images[1] 
                FROM properties p2 
                WHERE (p2.location->>'city') = (p.location->>'city') 
                    AND (p2.location->>'country') = (p.location->>'country')
                    AND array_length(p2.images, 1) > 0
                ORDER BY p2.created_at DESC 
                LIMIT 1
            ) as featured_image
        FROM properties p
        WHERE p.status = 'approved'
            AND (p.location->>'city') IS NOT NULL 
            AND (p.location->>'country') IS NOT NULL
        GROUP BY (location->>'city'), (location->>'country')
        HAVING COUNT(*) >= 2
        ORDER BY property_count DESC, avg_price ASC
        LIMIT limit_count
    ) city_stats;
    
    RETURN COALESCE(popular_places, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Usage Example
```typescript
// Frontend usage with useHomeFeed hook
const { popularPlaces, popularPlacesLoading, popularPlacesError } = useHomeFeed()

// Direct API call
const { data, error } = await supabase.rpc('get_popular_places', {
  limit_count: 6
})
```

#### Response Format
```json
[
  {
    "id": "paris-france",
    "name": "Paris",
    "country": "France", 
    "property_count": 25,
    "average_price": 150.50,
    "featured_image": "https://...",
    "coordinates": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  }
]
```

---

## 🏡 Properties Feed Section

### Purpose
Display a personalized feed of approved properties with infinite scroll, filtering, and sorting capabilities.

### API Function: `get_feed_and_filter_properties(...)`

#### Database Implementation
```sql
CREATE OR REPLACE FUNCTION get_feed_and_filter_properties(
    -- Location parameters
    search_city TEXT DEFAULT NULL,
    search_country TEXT DEFAULT NULL,
    search_lat DECIMAL(10,8) DEFAULT NULL,
    search_lng DECIMAL(11,8) DEFAULT NULL,
    search_radius_km INTEGER DEFAULT 50,
    
    -- Date parameters
    check_in DATE DEFAULT NULL,
    check_out DATE DEFAULT NULL,
    
    -- Capacity parameters
    guest_count INTEGER DEFAULT 1,
    min_bedrooms INTEGER DEFAULT 0,
    min_bathrooms INTEGER DEFAULT 0,
    
    -- Filter parameters
    price_min DECIMAL(10,2) DEFAULT NULL,
    price_max DECIMAL(10,2) DEFAULT NULL,
    property_types TEXT[] DEFAULT NULL,
    required_amenities TEXT[] DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL,
    
    -- Sorting and pagination
    sort_by TEXT DEFAULT 'relevance',
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20,
    
    -- User context
    user_id UUID DEFAULT auth.uid()
)
RETURNS JSON
```

#### Available Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search_city` | TEXT | Filter by city name | "Paris" |
| `search_country` | TEXT | Filter by country | "France" |
| `search_lat/lng` | DECIMAL | Geolocation coordinates | 48.8566, 2.3522 |
| `search_radius_km` | INTEGER | Search radius in kilometers | 50 |
| `check_in/out` | DATE | Availability date range | "2024-06-01" |
| `guest_count` | INTEGER | Minimum guest capacity | 4 |
| `min_bedrooms` | INTEGER | Minimum bedrooms | 2 |
| `min_bathrooms` | INTEGER | Minimum bathrooms | 1 |
| `price_min/max` | DECIMAL | Price range per night | 50.00, 200.00 |
| `property_types` | TEXT[] | Property type filter | ["apartment", "house"] |
| `required_amenities` | TEXT[] | Must-have amenities | ["wifi", "parking"] |
| `min_rating` | DECIMAL | Minimum property rating | 4.0 |

#### Available Sort Options

| Sort By | Description |
|---------|-------------|
| `relevance` | Best match (default) - combines rating, popularity, and distance |
| `price_low` | Price: Low to High |
| `price_high` | Price: High to Low |
| `rating` | Highest Rated |
| `newest` | Newest First |

#### Response Format
```json
{
  "data": [
    {
      "id": "property-uuid",
      "title": "Beautiful Apartment in Paris",
      "description": "...",
      "price": 150.00,
      "currency": "USD",
      "location": {
        "city": "Paris",
        "country": "France",
        "address": "123 Rue de la Paix",
        "coordinates": {
          "lat": 48.8566,
          "lng": 2.3522
        }
      },
      "images": ["url1", "url2"],
      "videos": ["video_url"],
      "property_type": "apartment",
      "max_guests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "amenities": ["wifi", "parking"],
      "rating": 4.8,
      "review_count": 24,
      "view_count": 150,
      "booking_count": 12,
      "cleaning_fee": 25.00,
      "service_fee": 15.00,
      "distance": "2.5 km away",
      "is_liked": false,
      "instant_book": true,
      "total_before_taxes": 190.00,
      "created_at": "2024-01-15T10:00:00Z",
      "host": {
        "id": "host-uuid",
        "name": "Marie Dubois",
        "username": "marie.dubois",
        "avatar_url": "https://...",
        "display_name": "Marie",
        "is_identity_verified": true,
        "is_email_verified": true,
        "rating": 4.9,
        "response_rate": 95,
        "response_time": "within an hour"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 20,
    "total_count": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "search_city": "Paris",
    "guest_count": 2,
    "price_range": {
      "min": 50,
      "max": 200
    }
  },
  "sort_by": "relevance"
}
```

---

## 🔧 Frontend Implementation

### Hooks Architecture

#### useHomeFeed Hook
```typescript
const {
  // Popular places
  popularPlaces,
  popularPlacesLoading,
  popularPlacesError,
  
  // Properties feed  
  properties,
  feedLoading,
  feedError,
  isLoadingMore,
  hasNextPage,
  totalCount,
  
  // Actions
  fetchPopularPlaces,
  fetchPropertiesFeed,
  loadMoreProperties,
  refreshFeed,
  handleLikeProperty,
  handlePropertyView
} = useHomeFeed()
```

#### useSearchFeed Hook
```typescript
const {
  // Search state
  searchQuery,
  filters,
  activeFiltersCount,
  sortBy,
  
  // Results
  properties,
  isLoading,
  error,
  isLoadingMore,
  hasNextPage,
  totalCount,
  
  // Actions
  performSearch,
  applyFilters,
  clearFilters,
  setSearchQuery,
  setSortBy,
  handleLikeProperty
} = useSearchFeed()
```

### Store Architecture

#### HomeFeedStore
- Manages popular places state
- Handles properties feed with infinite scroll
- Tracks user location for personalization
- Optimistic updates for user interactions

#### SearchFeedStore  
- Advanced filter management
- Search query handling
- Search history tracking
- Filter modal state management
- Results pagination

---

## 🎯 Key Features

### ✅ Infinite Scroll
- Automatic loading of more content as user scrolls
- Optimized performance with virtual scrolling
- Loading indicators and error handling

### ✅ Advanced Filtering
- **Location**: City, country, coordinates with radius
- **Dates**: Check-in/out availability
- **Capacity**: Guests, bedrooms, bathrooms
- **Price**: Range sliders with currency support
- **Property Types**: Multiple selection
- **Amenities**: Required amenities filtering
- **Rating**: Minimum rating threshold

### ✅ Smart Sorting
- **Relevance**: AI-powered best match
- **Price**: Low to high / High to low
- **Rating**: Highest rated first
- **Date**: Newest listings first

### ✅ Personalization
- User location-based distance calculation
- Saved properties tracking
- View count tracking
- Search history

### ✅ Performance Optimizations
- Database-level filtering and sorting
- Pagination with efficient queries
- Zustand state management
- Optimistic UI updates
- Error handling and loading states

---

## 🚀 Usage Examples

### Home Page Feed
```typescript
// Initialize home feed
const homeFeed = useHomeFeed()

// Auto-fetch on component mount
useEffect(() => {
  if (homeFeed.properties.length === 0) {
    homeFeed.fetchPropertiesFeed()
    homeFeed.fetchPopularPlaces()
  }
}, [])

// Infinite scroll
const handleScroll = useCallback(() => {
  if (reachedBottom && homeFeed.hasNextPage) {
    homeFeed.loadMoreProperties()
  }
}, [homeFeed.hasNextPage, homeFeed.loadMoreProperties])
```

### Search Page with Filters
```typescript
// Initialize search
const searchFeed = useSearchFeed()

// Apply filters
const handleApplyFilters = (newFilters) => {
  searchFeed.applyFilters({
    search_city: "Paris",
    guest_count: 4,
    price_min: 50,
    price_max: 200,
    required_amenities: ["wifi", "parking"]
  })
}

// Change sorting
const handleSort = (sortBy) => {
  searchFeed.setSortBy(sortBy)
}
```

---

## 📊 Database Performance Notes

- **Indexes**: Created on `status`, `location`, `price_per_night`, `rating`, `created_at`
- **Filtering**: Database-level filtering reduces data transfer
- **Pagination**: Efficient LIMIT/OFFSET with row counting
- **Caching**: Consider implementing Redis for popular queries
- **Monitoring**: Track slow queries and optimize accordingly

---

## 🔐 Security & Privacy

- All RPC functions use `SECURITY DEFINER`
- User authentication checked via `auth.uid()`
- Input validation and sanitization
- Rate limiting on search queries
- Privacy-compliant location handling

---

## 🎨 UI/UX Considerations

- **Mobile-first**: Responsive design for all screen sizes
- **Loading states**: Skeleton loaders and spinners
- **Error handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized images and lazy loading

---

## 🚧 Future Enhancements

- [ ] **Map Integration**: Interactive map view with property markers
- [ ] **Saved Searches**: Allow users to save filter combinations
- [ ] **Smart Recommendations**: ML-based property suggestions
- [ ] **Real-time Updates**: WebSocket for live availability updates
- [ ] **Advanced Analytics**: User behavior tracking and insights
- [ ] **A/B Testing**: Test different ranking algorithms
- [ ] **Internationalization**: Multi-language and currency support 