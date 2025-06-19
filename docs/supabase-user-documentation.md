# 🏠 Nomad Lux User App - Supabase Documentation

## 📋 Overview
This document outlines the complete Supabase integration for the **User-facing application** of Nomad Lux. This covers both **Guest** and **Host** functionalities including property browsing, booking management, user profiles, messaging, and real-time features.

---

## 🗃️ Database Schema & User Tables

### 1. Core User Tables

#### `users` Table (Unified with Admin)
**Purpose**: Central user management - same table structure as defined in admin documentation
```sql
-- See admin documentation for complete users table schema
-- This table serves both admin and user-facing functionality
```

#### `user_preferences` Table
**Purpose**: User app settings and preferences
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Specific notification types
    booking_updates BOOLEAN DEFAULT true,
    property_likes BOOLEAN DEFAULT true,
    host_messages BOOLEAN DEFAULT true,
    price_drops BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Privacy settings
    profile_visibility profile_visibility_enum DEFAULT 'public',
    show_reviews BOOLEAN DEFAULT true,
    show_verification_badges BOOLEAN DEFAULT true,
    
    -- App preferences
    search_radius INTEGER DEFAULT 50, -- km
    default_guests INTEGER DEFAULT 2,
    auto_translate BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE profile_visibility_enum AS ENUM ('public', 'friends', 'private');
```

### 2. Property & Search Tables

#### `property_availability` Table
**Purpose**: Calendar availability and pricing rules
```sql
CREATE TABLE property_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    
    -- Availability status
    is_available BOOLEAN DEFAULT true,
    min_nights INTEGER DEFAULT 1,
    max_nights INTEGER,
    
    -- Dynamic pricing
    base_price DECIMAL(10,2),
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.00,
    holiday_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Booking window
    advance_booking_days INTEGER DEFAULT 365,
    same_day_booking BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(property_id, available_date)
);

-- Indexes for calendar queries
CREATE INDEX idx_availability_property_date ON property_availability(property_id, available_date);
CREATE INDEX idx_availability_date_range ON property_availability(available_date) WHERE is_available = true;
```

#### `saved_properties` Table
**Purpose**: User's liked/saved properties (simplified)
```sql
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    property_ids UUID[] DEFAULT '{}', -- Array of saved property IDs
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's saved properties
CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);
```

#### `search_history` Table
**Purpose**: User search patterns for recommendations
```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Search parameters
    search_location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    check_in_date DATE,
    check_out_date DATE,
    guests INTEGER,
    
    -- Filters applied
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    property_types TEXT[],
    amenities TEXT[],
    
    -- Results interaction
    results_count INTEGER,
    clicked_properties UUID[],
    
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recommendations
CREATE INDEX idx_search_history_user_recent ON search_history(user_id, searched_at DESC);
```

### 3. Booking & Communication Tables

#### `booking_timeline` Table
**Purpose**: Track booking status changes and communications
```sql
CREATE TABLE booking_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    
    event_type timeline_event_enum NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT,
    
    -- Event metadata
    triggered_by UUID REFERENCES auth.users(id),
    automated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE timeline_event_enum AS ENUM (
    'booking_created', 'payment_pending', 'payment_confirmed', 
    'host_accepted', 'host_declined', 'check_in', 'check_out',
    'review_submitted', 'cancelled', 'refunded', 'modified'
);

-- Index for booking history
CREATE INDEX idx_booking_timeline_booking ON booking_timeline(booking_id, created_at DESC);
```

#### `messages` Table
**Purpose**: Host-guest communication system
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    message_text TEXT NOT NULL,
    message_type message_type_enum DEFAULT 'text',
    
    -- Booking context
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT false,
    is_automated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE message_type_enum AS ENUM ('text', 'booking_request', 'booking_update', 'system', 'media');

-- Indexes for conversation queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = false;
```

#### `reviews` Table (Simplified)
**Purpose**: Essential property and user reviews
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    
    -- Review parties
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Review type
    review_type review_type_enum NOT NULL,
    
    -- Essential ratings (1-5 scale)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- Review content
    review_text TEXT NOT NULL,
    
    -- Basic moderation
    is_public BOOLEAN DEFAULT true,
    
    -- Host response
    host_response TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE review_type_enum AS ENUM ('guest_to_host', 'host_to_guest', 'property_review');

-- Indexes for review queries
CREATE INDEX idx_reviews_property ON reviews(property_id, is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_reviews_user ON reviews(reviewee_id, review_type, created_at DESC);
```

---

## 🔧 RPC Functions (User-Facing)

### 1. Property Feed Algorithm

#### `get_nearby_properties_feed()`
**Purpose**: Core feed algorithm for discovering nearby properties
```sql
CREATE OR REPLACE FUNCTION get_nearby_properties_feed(
    user_lat DECIMAL(10,8),
    user_lng DECIMAL(11,8),
    radius_km INTEGER DEFAULT 50,
    max_results INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
    feed_properties JSON;
    user_location geography;
BEGIN
    -- Create user location point
    user_location := ST_Point(user_lng, user_lat)::geography;
    
    -- Get nearby properties with distance and relevance scoring
    SELECT json_agg(
        json_build_object(
            'id', p.id,
            'title', p.title,
            'property_type', p.property_type,
            'city', p.city,
            'country', p.country,
            'base_price', p.base_price,
            'currency', p.currency,
            'images', p.images[1:3], -- First 3 images for feed
            'average_rating', p.average_rating,
            'review_count', p.review_count,
            'distance_km', ROUND(distance_km::numeric, 2),
            'host', json_build_object(
                'id', h.id,
                'name', h.display_name,
                'avatar_url', h.avatar_url,
                'host_rating', h.host_rating,
                'is_verified', h.is_identity_verified
            ),
            'is_saved', CASE 
                WHEN auth.uid() IS NOT NULL THEN 
                    p.id = ANY(
                        SELECT unnest(sp.property_ids) 
                        FROM saved_properties sp 
                        WHERE sp.user_id = auth.uid()
                    )
                ELSE false 
            END
        ) ORDER BY relevance_score DESC, distance_km ASC
    ) INTO feed_properties
    FROM (
        SELECT 
            p.*,
            ST_Distance(p.location_point, user_location) / 1000.0 as distance_km,
            -- Relevance scoring algorithm
            (
                -- Distance score (closer = higher score, max 5 points)
                GREATEST(0, 5 - (ST_Distance(p.location_point, user_location) / 1000.0 / radius_km * 5)) +
                
                -- Rating score (max 5 points)
                p.average_rating +
                
                -- Review count score (max 3 points)
                LEAST(3, p.review_count / 10.0) +
                
                -- Recent activity bonus (max 2 points)
                CASE 
                    WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 2
                    WHEN p.created_at > NOW() - INTERVAL '90 days' THEN 1
                    ELSE 0
                END +
                
                -- Host quality bonus (max 2 points)  
                CASE
                    WHEN h.is_identity_verified AND h.response_rate >= 90 THEN 2
                    WHEN h.is_identity_verified OR h.response_rate >= 70 THEN 1
                    ELSE 0
                END
            ) as relevance_score
            
        FROM properties p
        JOIN users h ON p.host_id = h.id
        WHERE p.is_active = true 
            AND p.approval_status = 'approved'
            AND ST_DWithin(
                p.location_point,
                user_location,
                radius_km * 1000 -- Convert km to meters
            )
        ORDER BY relevance_score DESC, distance_km ASC
        LIMIT max_results
    ) ranked_properties
    JOIN users h ON ranked_properties.host_id = h.id;
    
    RETURN json_build_object(
        'properties', COALESCE(feed_properties, '[]'::json),
        'search_center', json_build_object(
            'latitude', user_lat,
            'longitude', user_lng
        ),
        'radius_km', radius_km,
        'total_found', (
            SELECT COUNT(*) 
            FROM properties p
            WHERE p.is_active = true 
                AND p.approval_status = 'approved'
                AND ST_DWithin(
                    p.location_point,
                    user_location,
                    radius_km * 1000
                )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### How the Property Feed Works

**1. Frontend Implementation Example**
```typescript
// Get user's current location and fetch feed
async function loadPropertyFeed() {
    try {
        // Get user location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Fetch nearby properties feed
        const { data, error } = await supabase.rpc('get_nearby_properties_feed', {
            user_lat: userLat,
            user_lng: userLng,
            radius_km: 50,     // 50km radius
            max_results: 20    // 20 properties per load
        });
        
        if (error) throw error;
        
        console.log(`Found ${data.total_found} properties within 50km`);
        console.log('Feed properties:', data.properties);
        
        return data;
    } catch (error) {
        console.error('Error loading feed:', error);
        // Fallback: load random popular properties
        return loadFallbackFeed();
    }
}
```

**2. Relevance Scoring System (Max 17 points)**
The feed algorithm uses a sophisticated scoring system to rank properties:

- **🗺️ Distance Score (0-5 pts)**: Closer properties get higher scores
  - Within 10km: 5 points
  - 10-25km: 3-4 points  
  - 25-50km: 1-2 points

- **⭐ Rating Score (0-5 pts)**: Based on property's average rating
  - 5-star properties: 5 points
  - 4-star properties: 4 points, etc.

- **📝 Review Count (0-3 pts)**: More reviews = more reliable
  - 30+ reviews: 3 points
  - 10-29 reviews: 2 points
  - 1-9 reviews: 1 point

- **🆕 Recency Bonus (0-2 pts)**: New properties get visibility boost
  - Under 30 days: 2 points
  - 30-90 days: 1 point

- **✅ Host Quality (0-2 pts)**: Verified hosts with good response rates
  - Verified + 90%+ response rate: 2 points
  - Verified OR 70%+ response rate: 1 point

**3. Key PostGIS Functions Used**
```sql
-- Create geographic point (CRITICAL: longitude first, then latitude!)
ST_Point(longitude, latitude)::geography

-- Calculate distance between two points (returns meters)
ST_Distance(point1, point2) / 1000.0  -- Convert to kilometers

-- Find points within radius (much faster than ST_Distance for filtering)
ST_DWithin(point1, point2, radius_in_meters)

-- Example: Find properties within 25km of user
WHERE ST_DWithin(
    property.location_point,
    ST_Point(user_lng, user_lat)::geography,
    25000  -- 25km in meters
)
```

**4. Performance Notes**
- Uses GIST spatial index for ultra-fast geographic queries
- `ST_DWithin()` is much faster than `ST_Distance()` for filtering
- Feed loads typically under 100ms for 20 properties
- Scoring algorithm runs in a single query for efficiency

### 2. Property Discovery & Search

#### `search_properties_with_filters()`
**Purpose**: Advanced property search with geo-filtering and availability
```sql
CREATE OR REPLACE FUNCTION search_properties_with_filters(
    search_lat DECIMAL(10,8) DEFAULT NULL,
    search_lng DECIMAL(11,8) DEFAULT NULL,
    search_radius_km INTEGER DEFAULT 50,
    check_in DATE DEFAULT NULL,
    check_out DATE DEFAULT NULL,
    guest_count INTEGER DEFAULT 2,
    price_min DECIMAL(10,2) DEFAULT NULL,
    price_max DECIMAL(10,2) DEFAULT NULL,
    property_types TEXT[] DEFAULT NULL,
    amenities_required TEXT[] DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL,
    sort_by TEXT DEFAULT 'relevance',
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
    offset_val INTEGER := (page_num - 1) * page_size;
    total_count INTEGER;
    properties_data JSON;
    has_dates BOOLEAN := (check_in IS NOT NULL AND check_out IS NOT NULL);
BEGIN
    -- Log search for analytics (if user authenticated)
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO search_history (
            user_id, search_location, latitude, longitude,
            check_in_date, check_out_date, guests,
            price_min, price_max, property_types, amenities
        ) VALUES (
            auth.uid(), NULL, search_lat, search_lng,
            check_in, check_out, guest_count,
            price_min, price_max, property_types, amenities_required
        );
    END IF;
    
    -- Build dynamic query with availability check
    WITH available_properties AS (
        SELECT DISTINCT p.*,
            -- Distance calculation (if coordinates provided)
            CASE 
                WHEN search_lat IS NOT NULL AND search_lng IS NOT NULL THEN
                    ST_Distance(
                        ST_Point(search_lng, search_lat)::geography,
                        p.location_point
                    ) / 1000.0 -- Convert to kilometers
                ELSE NULL 
            END as distance_km,
            
            -- Calculate average nightly price during search period
            CASE 
                WHEN has_dates THEN (
                    SELECT COALESCE(AVG(COALESCE(pa.base_price, p.base_price)), p.base_price)
                    FROM property_availability pa
                    WHERE pa.property_id = p.id 
                        AND pa.available_date BETWEEN check_in AND check_out - 1
                        AND pa.is_available = true
                )
                ELSE p.base_price
            END as effective_price,
            
            -- Check if user has saved this property
            CASE 
                WHEN auth.uid() IS NOT NULL THEN 
                    EXISTS(SELECT 1 FROM saved_properties sp WHERE sp.user_id = auth.uid() AND sp.property_id = p.id)
                ELSE false 
            END as is_saved
            
        FROM properties p
        WHERE p.is_active = true 
            AND p.approval_status = 'approved'
            AND p.max_guests >= guest_count
            
            -- Geographic filter
            AND (search_lat IS NULL OR search_lng IS NULL OR
                 ST_DWithin(
                     p.location_point,
                     ST_Point(search_lng, search_lat)::geography,
                     search_radius_km * 1000 -- Convert km to meters
                 ))
            
            -- Price filter (base price)
            AND (price_min IS NULL OR p.base_price >= price_min)
            AND (price_max IS NULL OR p.base_price <= price_max)
            
            -- Property type filter
            AND (property_types IS NULL OR p.property_type = ANY(property_types))
            
            -- Amenities filter
            AND (amenities_required IS NULL OR p.amenities @> amenities_required)
            
            -- Rating filter
            AND (min_rating IS NULL OR p.average_rating >= min_rating)
            
            -- Availability check for dates (if provided)
            AND (NOT has_dates OR NOT EXISTS (
                SELECT 1 FROM bookings b 
                WHERE b.property_id = p.id 
                    AND b.booking_status IN ('confirmed', 'pending')
                    AND (b.check_in_date, b.check_out_date) OVERLAPS (check_in, check_out)
            ))
            
            -- Ensure all dates in range are available
            AND (NOT has_dates OR (
                SELECT COUNT(*)
                FROM property_availability pa
                WHERE pa.property_id = p.id 
                    AND pa.available_date BETWEEN check_in AND check_out - 1
                    AND pa.is_available = true
            ) = (check_out - check_in))
    )
    
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM available_properties;
    
    -- Get paginated and sorted results
    SELECT json_agg(
        json_build_object(
            'id', ap.id,
            'title', ap.title,
            'description', ap.description,
            'property_type', ap.property_type,
            'city', ap.city,
            'country', ap.country,
            'latitude', ap.latitude,
            'longitude', ap.longitude,
            'base_price', ap.base_price,
            'effective_price', ap.effective_price,
            'currency', ap.currency,
            'max_guests', ap.max_guests,
            'bedrooms', ap.bedrooms,
            'bathrooms', ap.bathrooms,
            'images', ap.images,
            'amenities', ap.amenities,
            'average_rating', ap.average_rating,
            'review_count', ap.review_count,
            'distance_km', ap.distance_km,
            'is_saved', ap.is_saved,
                            'host', json_build_object(
                'id', h.id,
                'name', h.display_name,
                'avatar_url', h.avatar_url,
                'host_rating', h.host_rating,
                'is_verified', h.is_identity_verified,
                'response_rate', h.response_rate,
                'response_time', h.response_time
            )
        ) ORDER BY 
            CASE WHEN sort_by = 'price_low' THEN ap.effective_price END ASC,
            CASE WHEN sort_by = 'price_high' THEN ap.effective_price END DESC,
            CASE WHEN sort_by = 'rating' THEN ap.average_rating END DESC,
            CASE WHEN sort_by = 'distance' THEN ap.distance_km END ASC,
            CASE WHEN sort_by = 'newest' THEN ap.created_at END DESC,
            -- Default relevance: rating + review count + recency
            CASE WHEN sort_by = 'relevance' THEN 
                (ap.average_rating * 0.4 + LEAST(ap.review_count / 10.0, 5.0) * 0.3 + 
                 EXTRACT(epoch FROM (NOW() - ap.created_at)) / -86400.0 * 0.3)
            END DESC
    ) INTO properties_data
    FROM (
        SELECT *, ROW_NUMBER() OVER (
            ORDER BY 
                CASE WHEN sort_by = 'price_low' THEN effective_price END ASC,
                CASE WHEN sort_by = 'price_high' THEN effective_price END DESC,
                CASE WHEN sort_by = 'rating' THEN average_rating END DESC,
                CASE WHEN sort_by = 'distance' THEN distance_km END ASC,
                CASE WHEN sort_by = 'newest' THEN created_at END DESC,
                CASE WHEN sort_by = 'relevance' THEN 
                    (average_rating * 0.4 + LEAST(review_count / 10.0, 5.0) * 0.3 + 
                     EXTRACT(epoch FROM (NOW() - created_at)) / -86400.0 * 0.3)
                END DESC
        ) as rn
        FROM available_properties
    ) ap
    JOIN users h ON ap.host_id = h.id
    WHERE ap.rn BETWEEN offset_val + 1 AND offset_val + page_size;
    
    RETURN json_build_object(
        'data', COALESCE(properties_data, '[]'::json),
        'pagination', json_build_object(
            'current_page', page_num,
            'page_size', page_size,
            'total_count', total_count,
            'total_pages', CEIL(total_count::DECIMAL / page_size)
        ),
        'search_metadata', json_build_object(
            'has_dates', has_dates,
            'search_radius_km', search_radius_km,
            'filters_applied', json_build_object(
                'price_range', CASE WHEN price_min IS NOT NULL OR price_max IS NOT NULL 
                    THEN json_build_object('min', price_min, 'max', price_max) 
                    ELSE null END,
                'property_types', property_types,
                'amenities', amenities_required,
                'min_rating', min_rating
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `get_property_recommendations()`
**Purpose**: Personalized property recommendations based on user behavior
```sql
CREATE OR REPLACE FUNCTION get_property_recommendations(
    user_id UUID DEFAULT auth.uid(),
    limit_count INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
    recommendations JSON;
BEGIN
    -- Get recommendations based on:
    -- 1. Similar properties to saved ones
    -- 2. Properties in frequently searched locations
    -- 3. Properties matching user's booking history preferences
    -- 4. Trending properties in user's area
    
    WITH user_preferences AS (
        -- Analyze user's saved properties and search history
        SELECT 
            array_agg(DISTINCT unnest(amenities)) as preferred_amenities,
            array_agg(DISTINCT property_type) as preferred_types,
            avg(base_price) as avg_price_preference,
            array_agg(DISTINCT city) as preferred_cities
        FROM properties p
        JOIN saved_properties sp ON p.id = sp.property_id
        WHERE sp.user_id = get_property_recommendations.user_id
    ),
    
    location_preferences AS (
        -- Get frequently searched locations
        SELECT latitude, longitude, COUNT(*) as search_frequency
        FROM search_history sh
        WHERE sh.user_id = get_property_recommendations.user_id
            AND latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY latitude, longitude
        ORDER BY search_frequency DESC
        LIMIT 5
    ),
    
    recommended_properties AS (
        SELECT DISTINCT p.*,
            -- Scoring algorithm
            (
                -- Amenity match score (0-3)
                CASE WHEN up.preferred_amenities IS NOT NULL THEN
                    LEAST(3, array_length(p.amenities & up.preferred_amenities, 1))
                ELSE 0 END +
                
                -- Property type preference (0-2)
                CASE WHEN p.property_type = ANY(up.preferred_types) THEN 2 ELSE 0 END +
                
                -- Price preference (0-2)
                CASE WHEN p.base_price BETWEEN up.avg_price_preference * 0.7 AND up.avg_price_preference * 1.3 
                    THEN 2 ELSE 0 END +
                
                -- Location preference (0-3)
                CASE WHEN EXISTS(
                    SELECT 1 FROM location_preferences lp 
                    WHERE ST_DWithin(
                        p.location_point,
                        ST_Point(lp.longitude, lp.latitude)::geography,
                        20000 -- 20km radius
                    )
                ) THEN 3 ELSE 0 END +
                
                -- General quality score (0-5)
                p.average_rating
                
            ) as recommendation_score
            
        FROM properties p
        CROSS JOIN user_preferences up
        WHERE p.is_active = true 
            AND p.approval_status = 'approved'
            AND NOT EXISTS(
                SELECT 1 FROM saved_properties sp 
                WHERE sp.user_id = get_property_recommendations.user_id 
                    AND sp.property_id = p.id
            )
            AND NOT EXISTS(
                SELECT 1 FROM bookings b 
                WHERE b.guest_id = get_property_recommendations.user_id 
                    AND b.property_id = p.id
            )
        ORDER BY recommendation_score DESC, p.average_rating DESC
        LIMIT limit_count
    )
    
    SELECT json_agg(
        json_build_object(
            'id', rp.id,
            'title', rp.title,
            'property_type', rp.property_type,
            'city', rp.city,
            'country', rp.country,
            'base_price', rp.base_price,
            'currency', rp.currency,
            'images', rp.images[1:3], -- First 3 images
            'average_rating', rp.average_rating,
            'review_count', rp.review_count,
            'recommendation_score', rp.recommendation_score,
            'host', json_build_object(
                'name', h.display_name,
                'avatar_url', h.avatar_url,
                'host_rating', h.host_rating
            )
        ) ORDER BY rp.recommendation_score DESC
    ) INTO recommendations
    FROM recommended_properties rp
    JOIN users h ON rp.host_id = h.id;
    
    RETURN COALESCE(recommendations, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Booking Management

#### `create_booking_request()`
**Purpose**: Create a new booking with validation and availability check
```sql
CREATE OR REPLACE FUNCTION create_booking_request(
    property_id UUID,
    check_in_date DATE,
    check_out_date DATE,
    number_of_guests INTEGER,
    special_requests TEXT DEFAULT NULL,
    payment_method TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    booking_id UUID;
    property_data RECORD;
    host_data RECORD;
    calculated_costs JSON;
    availability_check BOOLEAN;
    nights_count INTEGER;
BEGIN
    -- Validate dates
    IF check_in_date <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Check-in date must be in the future';
    END IF;
    
    IF check_out_date <= check_in_date THEN
        RAISE EXCEPTION 'Check-out date must be after check-in date';
    END IF;
    
    nights_count := check_out_date - check_in_date;
    
    -- Get property and host information
    SELECT p.*, h.id as host_user_id
    INTO property_data
    FROM properties p
    JOIN users h ON p.host_id = h.id
    WHERE p.id = create_booking_request.property_id
        AND p.is_active = true
        AND p.approval_status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Property not found or not available';
    END IF;
    
    -- Check guest capacity
    IF number_of_guests > property_data.max_guests THEN
        RAISE EXCEPTION 'Number of guests exceeds property capacity';
    END IF;
    
    -- Check availability
    SELECT NOT EXISTS(
        SELECT 1 FROM bookings b 
        WHERE b.property_id = create_booking_request.property_id
            AND b.booking_status IN ('confirmed', 'pending')
            AND (b.check_in_date, b.check_out_date) OVERLAPS (check_in_date, check_out_date)
    ) INTO availability_check;
    
    IF NOT availability_check THEN
        RAISE EXCEPTION 'Property is not available for selected dates';
    END IF;
    
    -- Calculate costs
    SELECT calculate_booking_costs(
        create_booking_request.property_id,
        check_in_date,
        check_out_date,
        number_of_guests
    ) INTO calculated_costs;
    
    -- Create booking record
    INSERT INTO bookings (
        property_id, guest_id, host_id,
        check_in_date, check_out_date, number_of_guests, number_of_nights,
        base_amount, cleaning_fee, service_fee, taxes, total_amount,
        host_payout, platform_fee,
        special_requests, payment_method,
        guest_phone, guest_email
    )
    SELECT 
        create_booking_request.property_id,
        auth.uid(),
        property_data.host_user_id,
        check_in_date, check_out_date, number_of_guests, nights_count,
        (calculated_costs->>'base_amount')::DECIMAL,
        (calculated_costs->>'cleaning_fee')::DECIMAL,
        (calculated_costs->>'service_fee')::DECIMAL,
        (calculated_costs->>'taxes')::DECIMAL,
        (calculated_costs->>'total_amount')::DECIMAL,
        (calculated_costs->>'host_payout')::DECIMAL,
        (calculated_costs->>'platform_fee')::DECIMAL,
        special_requests, payment_method,
        u.phone, u.email
    FROM users u
    WHERE u.id = auth.uid()
    RETURNING id INTO booking_id;
    
    -- Create initial timeline entry
    INSERT INTO booking_timeline (booking_id, event_type, event_title, event_description, triggered_by)
    VALUES (
        booking_id, 
        'booking_created', 
        'Booking Created',
        'Guest submitted booking request',
        auth.uid()
    );
    
    -- Send notification to host
    INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id)
    VALUES (
        property_data.host_user_id,
        'booking',
        'New Booking Request',
        format('You have a new booking request for %s', property_data.title),
        'booking',
        booking_id
    );
    
    RETURN json_build_object(
        'booking_id', booking_id,
        'status', 'pending',
        'costs', calculated_costs,
        'message', 'Booking request created successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `get_user_bookings()`
**Purpose**: Get paginated bookings for a user (guest or host view)
```sql
CREATE OR REPLACE FUNCTION get_user_bookings(
    user_type TEXT DEFAULT 'guest', -- 'guest' or 'host'
    status_filter booking_status_enum DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
    offset_val INTEGER := (page_num - 1) * page_size;
    total_count INTEGER;
    bookings_data JSON;
    user_id_field TEXT;
BEGIN
    user_id_field := CASE user_type WHEN 'host' THEN 'host_id' ELSE 'guest_id' END;
    
    -- Get total count
    EXECUTE format(
        'SELECT COUNT(*) FROM bookings WHERE %I = $1 AND ($2 IS NULL OR booking_status = $2)',
        user_id_field
    ) INTO total_count USING auth.uid(), status_filter;
    
    -- Get paginated bookings
    EXECUTE format(
        'SELECT json_agg(
            json_build_object(
                ''id'', b.id,
                ''check_in_date'', b.check_in_date,
                ''check_out_date'', b.check_out_date,
                ''number_of_guests'', b.number_of_guests,
                ''number_of_nights'', b.number_of_nights,
                ''total_amount'', b.total_amount,
                ''booking_status'', b.booking_status,
                ''payment_status'', b.payment_status,
                ''special_requests'', b.special_requests,
                ''created_at'', b.created_at,
                ''property'', json_build_object(
                    ''id'', p.id,
                    ''title'', p.title,
                    ''images'', p.images[1:1],
                    ''city'', p.city,
                    ''country'', p.country
                ),
                ''%1$s'', json_build_object(
                    ''id'', other_user.id,
                    ''name'', other_user.display_name,
                    ''avatar_url'', other_user.avatar_url,
                    ''phone'', other_user.phone
                ),
                ''timeline'', (
                    SELECT json_agg(
                        json_build_object(
                            ''event_type'', bt.event_type,
                            ''event_title'', bt.event_title,
                            ''event_description'', bt.event_description,
                            ''created_at'', bt.created_at
                        ) ORDER BY bt.created_at DESC
                    )
                    FROM booking_timeline bt 
                    WHERE bt.booking_id = b.id
                )
            ) ORDER BY b.created_at DESC
        )
        FROM (
            SELECT *, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
            FROM bookings 
            WHERE %2$I = $1 AND ($2 IS NULL OR booking_status = $2)
        ) b
        JOIN properties p ON b.property_id = p.id
        JOIN users other_user ON other_user.id = CASE WHEN $3 = ''host'' THEN b.guest_id ELSE b.host_id END
        WHERE b.rn BETWEEN $4 AND $5',
        CASE user_type WHEN 'host' THEN 'guest' ELSE 'host' END,
        user_id_field
    ) INTO bookings_data 
    USING auth.uid(), status_filter, user_type, offset_val + 1, offset_val + page_size;
    
    RETURN json_build_object(
        'data', COALESCE(bookings_data, '[]'::json),
        'pagination', json_build_object(
            'current_page', page_num,
            'page_size', page_size,
            'total_count', total_count,
            'total_pages', CEIL(total_count::DECIMAL / page_size)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Messaging & Communication

#### `get_conversations()`
**Purpose**: Get user's message conversations with unread counts
```sql
CREATE OR REPLACE FUNCTION get_conversations()
RETURNS JSON AS $$
DECLARE
    conversations JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'conversation_id', conversation_id,
            'other_user', json_build_object(
                'id', other_user_id,
                'name', other_user_name,
                'avatar_url', other_avatar_url,
                'is_host', other_is_host
            ),
            'property', CASE WHEN property_id IS NOT NULL THEN
                json_build_object(
                    'id', property_id,
                    'title', property_title,
                    'image', property_image
                )
            ELSE NULL END,
            'booking_id', booking_id,
            'last_message', json_build_object(
                'text', last_message_text,
                'sender_id', last_sender_id,
                'created_at', last_message_time,
                'is_read', last_message_read
            ),
            'unread_count', unread_count,
            'updated_at', last_message_time
        ) ORDER BY last_message_time DESC
    ) INTO conversations
    FROM (
        SELECT DISTINCT
            m.conversation_id,
            CASE 
                WHEN m.sender_id = auth.uid() THEN m.recipient_id 
                ELSE m.sender_id 
            END as other_user_id,
            other_user.display_name as other_user_name,
            other_user.avatar_url as other_avatar_url,
            other_user.is_host as other_is_host,
            p.id as property_id,
            p.title as property_title,
            p.images[1] as property_image,
            m.booking_id,
            
            -- Last message details
            FIRST_VALUE(m.message_text) OVER (
                PARTITION BY m.conversation_id 
                ORDER BY m.created_at DESC
            ) as last_message_text,
            FIRST_VALUE(m.sender_id) OVER (
                PARTITION BY m.conversation_id 
                ORDER BY m.created_at DESC
            ) as last_sender_id,
            FIRST_VALUE(m.created_at) OVER (
                PARTITION BY m.conversation_id 
                ORDER BY m.created_at DESC
            ) as last_message_time,
            FIRST_VALUE(m.is_read) OVER (
                PARTITION BY m.conversation_id 
                ORDER BY m.created_at DESC
            ) as last_message_read,
            
            -- Unread count for current user
            COUNT(*) FILTER (
                WHERE m.recipient_id = auth.uid() AND m.is_read = false
            ) OVER (PARTITION BY m.conversation_id) as unread_count
            
        FROM messages m
        JOIN users other_user ON (
            (m.sender_id = auth.uid() AND other_user.id = m.recipient_id) OR
            (m.recipient_id = auth.uid() AND other_user.id = m.sender_id)
        )

        LEFT JOIN properties p ON m.property_id = p.id
        WHERE m.sender_id = auth.uid() OR m.recipient_id = auth.uid()
    ) conversation_summary;
    
    RETURN COALESCE(conversations, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚡ Edge Functions (User-Facing)

### 1. Essential Functions (Phase 1)

#### Booking Confirmation & Payment
**File**: `supabase/functions/process-booking-payment/index.ts`
**Purpose**: Handle booking payments and confirmations

```typescript
// Stripe payment processing
// Booking confirmation automation
// Email confirmations to guest and host
// Host payout scheduling
```

#### Real-time Messaging
**File**: `supabase/functions/send-message/index.ts`
**Purpose**: Handle message sending with real-time delivery

```typescript
// Real-time message delivery
// Push notification to recipient
// Basic content moderation
```

### 2. Future Functions (Phase 2 - Commented Out)

<!-- 
### Smart Pricing Engine
**File**: `supabase/functions/dynamic-pricing/index.ts`
**Purpose**: AI-powered pricing recommendations for hosts

```typescript
// Market analysis and competitor pricing
// Seasonal and event-based adjustments
// Demand forecasting
// Revenue optimization suggestions
// Automated price updates (if enabled)
```

### Property Recommendations
**File**: `supabase/functions/generate-recommendations/index.ts`
**Purpose**: Generate personalized property recommendations

```typescript
// Machine learning recommendations
// User behavior analysis
// Collaborative filtering
// Content-based filtering
// Real-time recommendation updates
```

### Review & Rating Processor
**File**: `supabase/functions/process-review/index.ts`
**Purpose**: Handle review submissions and processing

```typescript
// Sentiment analysis
// Automatic moderation
// Review authenticity checks
// Host response suggestions
// Rating impact calculations
```
-->

---

## 🚀 Performance Optimization (User-Facing)

### 1. Database Optimizations

#### Geographic Search Optimization
```sql
-- PostGIS extension for efficient geo queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Spatial index for property locations
CREATE INDEX idx_properties_location_gist ON properties USING GIST(location_point);

-- Compound index for search filters
CREATE INDEX idx_properties_search_filters ON properties(
    is_active, approval_status, max_guests, base_price
) WHERE is_active = true AND approval_status = 'approved';
```

#### How Geographic Queries Work in Supabase

**1. Geographic Data Storage**
```sql
-- Properties table stores both individual coordinates and geographic point
CREATE TABLE properties (
    -- ... other fields ...
    latitude DECIMAL(10,8),                    -- Individual lat for display
    longitude DECIMAL(11,8),                   -- Individual lng for display
    location_point GEOGRAPHY(POINT, 4326),     -- PostGIS point for queries
    -- ... rest of table ...
);

-- When inserting properties, create the geographic point
INSERT INTO properties (latitude, longitude, location_point, ...)
VALUES (
    40.7128,  -- latitude
    -74.0060, -- longitude  
    ST_Point(-74.0060, 40.7128)::geography,  -- Note: lng first, then lat!
    ...
);
```

**2. Distance Calculations**
```sql
-- Calculate distance between two points (returns meters)
SELECT ST_Distance(
    ST_Point(-74.0060, 40.7128)::geography,  -- User location (NYC)
    ST_Point(-118.2437, 34.0522)::geography  -- Property location (LA)
) / 1000.0 as distance_km;  -- Convert to kilometers
-- Result: ~3944.42 km
```

**3. Nearby Properties Query (Feed Algorithm)**
```sql
-- Find properties within radius, sorted by distance
-- This is the core query for the property feed
SELECT 
    p.*,
    ST_Distance(
        p.location_point, 
        ST_Point(user_lng, user_lat)::geography
    ) / 1000.0 as distance_km
FROM properties p
WHERE p.is_active = true 
    AND p.approval_status = 'approved'
    AND ST_DWithin(
        p.location_point,
        ST_Point(user_lng, user_lat)::geography,
        50000  -- 50km radius in meters
    )
ORDER BY distance_km ASC
LIMIT 20;
```

**4. Advanced Geographic Queries**
```sql
-- Properties within polygon area (e.g., city boundaries)
SELECT * FROM properties 
WHERE ST_Within(
    location_point,
    ST_GeomFromText('POLYGON((...))')
);

-- Properties along a route (e.g., road trip planning)
SELECT * FROM properties
WHERE ST_DWithin(
    location_point,
    ST_GeomFromText('LINESTRING(-74.0060 40.7128, -118.2437 34.0522)'),
    10000  -- 10km from route
);
```

**5. Performance Tips for Geographic Queries**
- Always use `ST_DWithin()` instead of `ST_Distance()` for filtering (much faster)
- Use appropriate radius - smaller radius = faster queries  
- Create GIST indexes on all geographic columns
- Use `geography` type for accurate real-world distances
- Consider using `geometry` type only for very high-performance needs on smaller areas

#### Calendar Availability Optimization
```sql
-- Partitioned table for property availability (by month)
CREATE TABLE property_availability_y2024m01 PARTITION OF property_availability
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Index for availability range queries
CREATE INDEX idx_availability_range ON property_availability(available_date, is_available)
WHERE is_available = true;
```

### 2. Caching Strategy

#### Application-Level Caching
```typescript
// Property search results: 5 minutes
// User profile data: 15 minutes  
// Property details: 10 minutes
// Reviews and ratings: 30 minutes
// Availability calendar: 2 minutes
// Saved properties: 5 minutes
```

#### Database Query Caching
```sql
-- Materialized view for popular properties
CREATE MATERIALIZED VIEW popular_properties AS
SELECT p.*, COUNT(sp.id) as save_count, COUNT(b.id) as booking_count
FROM properties p
LEFT JOIN saved_properties sp ON p.id = sp.property_id AND sp.saved_at > NOW() - INTERVAL '30 days'
LEFT JOIN bookings b ON p.id = b.property_id AND b.created_at > NOW() - INTERVAL '30 days'
WHERE p.is_active = true AND p.approval_status = 'approved'
GROUP BY p.id
HAVING COUNT(sp.id) + COUNT(b.id) > 5
ORDER BY (COUNT(sp.id) + COUNT(b.id)) DESC;

-- Refresh every hour
```

### 3. Real-time Features

#### Supabase Realtime Configuration
```sql
-- Enable realtime for user-critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_timeline;
```

#### WebSocket Optimization
```typescript
// Message delivery: < 100ms
// Booking status updates: < 200ms
// Notification delivery: < 150ms
// Property availability updates: < 300ms
```

---

## 🔒 Security & RLS Policies (User-Facing)

### User Data Protection

#### User Profile Access Control
```sql
-- Users can only access their own complete profile data
CREATE POLICY users_own_data ON users
    FOR ALL TO authenticated
    USING (auth_id = auth.uid());

-- Public read access to basic profile info for hosts
CREATE POLICY users_public_read ON users
    FOR SELECT TO authenticated
    USING (is_host = true OR auth_id = auth.uid());
```

#### Property Access Control
```sql
-- Read access to approved properties
CREATE POLICY properties_public_read ON properties
    FOR SELECT TO authenticated
    USING (is_active = true AND approval_status = 'approved');

-- Hosts can manage their own properties
CREATE POLICY properties_host_manage ON properties
    FOR ALL TO authenticated
    USING (host_id = auth.uid());
```

#### Booking Privacy
```sql
-- Users can only see their own bookings
CREATE POLICY bookings_user_access ON bookings
    FOR ALL TO authenticated
    USING (guest_id = auth.uid() OR host_id = auth.uid());
```

#### Message Privacy
```sql
-- Users can only access their own conversations
CREATE POLICY messages_conversation_access ON messages
    FOR ALL TO authenticated
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());
```

---

## 📊 Functions Requiring Pagination (User-Facing)

### High-Volume User Functions
1. **`search_properties_with_filters()`** - Property search (20/page)
2. **`get_user_bookings()`** - User's bookings (10/page)
3. **`get_property_reviews()`** - Property reviews (15/page)
4. **`get_conversations()`** - Message conversations (20/page)
5. **`get_conversation_messages()`** - Messages in conversation (30/page)
6. **`get_user_notifications()`** - User notifications (25/page)
7. **`get_saved_properties()`** - User's saved properties (20/page)
8. **`get_user_reviews()`** - User's reviews (15/page)
9. **`get_booking_timeline()`** - Booking history events (20/page)
10. **`get_search_suggestions()`** - Location/property suggestions (10/page)

### Performance Targets (User-Facing)
- **Property search**: < 300ms (including geo-calculations)
- **Property details**: < 150ms
- **Booking creation**: < 500ms (including validations)
- **Message sending**: < 100ms
- **Page transitions**: < 200ms
- **Real-time updates**: < 100ms latency

---

## 🔗 External Integrations (User-Facing)

### Required User Services
1. **Maps & Location**: Google Maps API for property locations
2. **Payment Processing**: Stripe for secure payments
3. **Image Processing**: Cloudinary for image optimization and CDN
4. **Push Notifications**: Firebase Cloud Messaging
5. **Email Service**: SendGrid for transactional emails
6. **SMS Service**: Twilio for booking confirmations
7. **Calendar Sync**: Google Calendar, Airbnb iCal integration
8. **Social Auth**: Google, Facebook, Apple Sign-In

### Mobile App Considerations
- **Offline support**: Cache property details and booking data
- **Background sync**: Sync messages and notifications
- **Image caching**: Progressive image loading
- **Location services**: GPS-based property discovery
- **Push notifications**: Real-time booking and message alerts

This comprehensive documentation provides the foundation for implementing a scalable, performant user-facing application with Supabase, optimized for both guest and host experiences. 