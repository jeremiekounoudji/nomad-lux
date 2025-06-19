# 🔧 Nomad Lux Admin Panel - Supabase Documentation

## 📋 Overview
This document outlines the complete Supabase integration for the **Admin Panel** of Nomad Lux, a luxury property booking platform. The admin system handles property management, user administration, booking oversight, analytics, and dispute resolution.

---

## 🗃️ Database Schema & Tables

### 1. Core Tables

#### `users` Table
**Purpose**: Central user management for all user types (guests, hosts, admins)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    location TEXT,
    date_of_birth DATE,
    
    -- Verification status
    is_phone_verified BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    is_identity_verified BOOLEAN DEFAULT false,
    
    -- User role and status
    user_role user_role_enum DEFAULT 'guest',
    account_status user_status_enum DEFAULT 'active',
    
    -- Host specific fields
    is_host BOOLEAN DEFAULT false,
    host_since DATE,
    response_rate INTEGER DEFAULT 0,
    response_time TEXT, -- 'within an hour', 'within a few hours', etc.
    
    -- Ratings and statistics
    guest_rating DECIMAL(3,2) DEFAULT 0.00,
    host_rating DECIMAL(3,2) DEFAULT 0.00,
    total_guest_reviews INTEGER DEFAULT 0,
    total_host_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_properties INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Preferences
    preferred_currency TEXT DEFAULT 'USD',
    language_preference TEXT DEFAULT 'en',
    timezone TEXT,
    
    -- Activity tracking
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums
CREATE TYPE user_role_enum AS ENUM ('guest', 'host', 'both', 'admin', 'super_admin');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'pending', 'banned');
```

#### `properties` Table
**Purpose**: Property listings with location optimization and admin fields
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL,
    max_guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    
    -- Location data (optimized for geo queries)
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    full_address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS for performance
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0.00,
    service_fee DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    
    -- Media
    images TEXT[] NOT NULL,
    videos TEXT[],
    amenities TEXT[] DEFAULT '{}',
    
    -- Admin/Status fields
    approval_status approval_status_enum DEFAULT 'pending',
    admin_notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Performance fields
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Indexes for performance
CREATE INDEX idx_properties_location ON properties USING GIST(location_point);
CREATE INDEX idx_properties_host_id ON properties(host_id);
CREATE INDEX idx_properties_approval_status ON properties(approval_status);
CREATE INDEX idx_properties_active_featured ON properties(is_active, is_featured) WHERE is_active = true;
```

#### `bookings` Table
**Purpose**: Comprehensive booking management with financial tracking
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES users(id) ON DELETE CASCADE,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Booking details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    number_of_nights INTEGER NOT NULL,
    
    -- Financial breakdown
    base_amount DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0.00,
    service_fee DECIMAL(10,2) DEFAULT 0.00,
    taxes DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    host_payout DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    
    -- Status tracking
    booking_status booking_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method TEXT,
    payment_id TEXT,
    
    -- Guest information
    special_requests TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    
    -- Admin fields
    admin_notes TEXT,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'dispute', 'no_show');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'refunded', 'partial_refund', 'failed');

-- Indexes
CREATE INDEX idx_bookings_property_dates ON bookings(property_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status, payment_status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
```

### 2. Supporting Tables

#### `booking_requests` Table
**Purpose**: Pending booking requests requiring host approval
```sql
CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES users(id) ON DELETE CASCADE,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    guest_message TEXT,
    
    request_status request_status_enum DEFAULT 'pending',
    host_response TEXT,
    
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE request_status_enum AS ENUM ('pending', 'approved', 'declined', 'expired');
```

#### `disputes` Table
**Purpose**: Dispute management and resolution tracking
```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dispute_type dispute_type_enum NOT NULL,
    priority_level priority_enum DEFAULT 'medium',
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    
    dispute_status dispute_status_enum DEFAULT 'open',
    assigned_admin_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolution_amount DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE dispute_type_enum AS ENUM ('cancellation', 'refund', 'property_issue', 'guest_behavior', 'payment_issue', 'damage');
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE dispute_status_enum AS ENUM ('open', 'investigating', 'resolved', 'escalated', 'closed');
```

#### `notifications` Table
**Purpose**: System-wide notification management
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    related_entity_type TEXT, -- 'booking', 'property', 'user', etc.
    related_entity_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    is_pushed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE notification_type_enum AS ENUM ('booking', 'like', 'review', 'message', 'system', 'dispute', 'payment');

-- Index for efficient queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

#### `admin_activities` Table
**Purpose**: Audit trail for admin actions
```sql
CREATE TABLE admin_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type_enum NOT NULL,
    entity_type TEXT NOT NULL, -- 'user', 'property', 'booking', etc.
    entity_id UUID NOT NULL,
    
    action_description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE activity_type_enum AS ENUM ('create', 'update', 'delete', 'approve', 'reject', 'suspend', 'activate', 'refund');

-- Index for admin dashboard
CREATE INDEX idx_admin_activities_admin_date ON admin_activities(admin_id, created_at DESC);
CREATE INDEX idx_admin_activities_entity ON admin_activities(entity_type, entity_id);
```

---

## 🔧 RPC Functions (Stored Procedures)

### 1. Dashboard Analytics

#### `get_admin_dashboard_stats()`
**Purpose**: Real-time dashboard metrics with caching optimization
```sql
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(
    period_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_date_start DATE := CURRENT_DATE - INTERVAL '1 day' * period_days;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users WHERE user_role != 'admin'),
        'new_users_period', (SELECT COUNT(*) FROM users WHERE created_at >= current_date_start AND user_role != 'admin'),
        'total_properties', (SELECT COUNT(*) FROM properties WHERE is_active = true),
        'pending_properties', (SELECT COUNT(*) FROM properties WHERE approval_status = 'pending'),
        'total_bookings', (SELECT COUNT(*) FROM bookings),
        'pending_bookings', (SELECT COUNT(*) FROM bookings WHERE booking_status = 'pending'),
        'total_revenue', (SELECT COALESCE(SUM(platform_fee), 0) FROM bookings WHERE payment_status = 'paid'),
        'revenue_period', (SELECT COALESCE(SUM(platform_fee), 0) FROM bookings WHERE payment_status = 'paid' AND created_at >= current_date_start),
        'active_disputes', (SELECT COUNT(*) FROM disputes WHERE dispute_status IN ('open', 'investigating')),
        'conversion_rate', (
            SELECT CASE 
                WHEN COUNT(*) > 0 THEN 
                    ROUND((COUNT(*) FILTER (WHERE booking_status IN ('confirmed', 'completed'))::DECIMAL / COUNT(*) * 100), 2)
                ELSE 0 
            END
            FROM bookings 
            WHERE created_at >= current_date_start
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `get_revenue_analytics(start_date DATE, end_date DATE)`
**Purpose**: Detailed revenue breakdown and trends
```sql
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_revenue', COALESCE(SUM(total_amount), 0),
        'platform_fees', COALESCE(SUM(platform_fee), 0),
        'host_payouts', COALESCE(SUM(host_payout), 0),
        'daily_breakdown', (
            SELECT json_agg(
                json_build_object(
                    'date', booking_date,
                    'revenue', daily_revenue,
                    'bookings', booking_count
                ) ORDER BY booking_date
            )
            FROM (
                SELECT 
                    DATE(created_at) as booking_date,
                    SUM(platform_fee) as daily_revenue,
                    COUNT(*) as booking_count
                FROM bookings 
                WHERE DATE(created_at) BETWEEN start_date AND end_date
                    AND payment_status = 'paid'
                GROUP BY DATE(created_at)
            ) daily_stats
        ),
        'top_properties', (
            SELECT json_agg(
                json_build_object(
                    'property_id', property_id,
                    'title', p.title,
                    'revenue', property_revenue,
                    'bookings', booking_count
                ) ORDER BY property_revenue DESC
            )
            FROM (
                SELECT 
                    b.property_id,
                    SUM(b.platform_fee) as property_revenue,
                    COUNT(*) as booking_count
                FROM bookings b
                WHERE DATE(b.created_at) BETWEEN start_date AND end_date
                    AND b.payment_status = 'paid'
                GROUP BY b.property_id
                ORDER BY property_revenue DESC
                LIMIT 10
            ) prop_stats
            JOIN properties p ON p.id = prop_stats.property_id
        )
    ) INTO result
    FROM bookings 
    WHERE DATE(created_at) BETWEEN start_date AND end_date
        AND payment_status = 'paid';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. User Management

#### `get_paginated_users()`
**Purpose**: Optimized user listing with filtering and sorting
```sql
CREATE OR REPLACE FUNCTION get_paginated_users(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20,
    search_term TEXT DEFAULT NULL,
    user_role_filter user_role_enum DEFAULT NULL,
    status_filter user_status_enum DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'DESC'
)
RETURNS JSON AS $$
DECLARE
    offset_val INTEGER := (page_num - 1) * page_size;
    total_count INTEGER;
    users_data JSON;
    sort_column TEXT;
BEGIN
    -- Validate sort column
    sort_column := CASE sort_by
        WHEN 'name' THEN 'name'
        WHEN 'email' THEN 'email'
        WHEN 'join_date' THEN 'join_date'
        WHEN 'last_login' THEN 'last_login'
        WHEN 'total_bookings' THEN 'total_bookings'
        WHEN 'total_revenue' THEN 'total_revenue'
        ELSE 'created_at'
    END;
    
    -- Get total count with filters
    SELECT COUNT(*) INTO total_count
    FROM users u
    WHERE (user_role_filter IS NULL OR u.user_role = user_role_filter)
        AND (status_filter IS NULL OR u.account_status = status_filter)
        AND (search_term IS NULL OR 
             u.name ILIKE '%' || search_term || '%' OR 
             u.email ILIKE '%' || search_term || '%' OR
             u.username ILIKE '%' || search_term || '%')
        AND u.user_role != 'admin'; -- Exclude admin users
    
    -- Get paginated data
    EXECUTE format(
        'SELECT json_agg(
            json_build_object(
                ''id'', id,
                ''name'', name,
                ''email'', email,
                ''username'', username,
                ''avatar_url'', avatar_url,
                ''phone'', phone,
                ''user_role'', user_role,
                ''account_status'', account_status,
                ''is_verified'', is_verified,
                ''total_bookings'', total_bookings,
                ''total_properties'', total_properties,
                ''total_revenue'', total_revenue,
                ''average_rating'', average_rating,
                ''join_date'', join_date,
                ''last_login'', last_login
            ) ORDER BY %I %s
        )
        FROM (
            SELECT *
            FROM users u
            WHERE (CASE WHEN $1 IS NOT NULL THEN u.user_role = $1 ELSE true END)
                AND (CASE WHEN $2 IS NOT NULL THEN u.account_status = $2 ELSE true END)
                AND (CASE WHEN $3 IS NOT NULL THEN 
                    u.name ILIKE ''%%'' || $3 || ''%%'' OR 
                    u.email ILIKE ''%%'' || $3 || ''%%'' OR
                    u.username ILIKE ''%%'' || $3 || ''%%''
                ELSE true END)
                AND u.user_role != ''admin''
            ORDER BY %I %s
            LIMIT $4 OFFSET $5
        ) paginated_users',
        sort_column, sort_direction, sort_column, sort_direction
    ) 
    INTO users_data
    USING user_role_filter, status_filter, search_term, page_size, offset_val;
    
    RETURN json_build_object(
        'data', COALESCE(users_data, '[]'::json),
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

### 3. Property Management

#### `get_paginated_properties_admin()`
**Purpose**: Admin property listing with comprehensive filters
```sql
CREATE OR REPLACE FUNCTION get_paginated_properties_admin(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20,
    approval_status_filter approval_status_enum DEFAULT NULL,
    property_type_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'DESC'
)
RETURNS JSON AS $$
DECLARE
    offset_val INTEGER := (page_num - 1) * page_size;
    total_count INTEGER;
    properties_data JSON;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM properties p
    JOIN users h ON p.host_id = h.id
    WHERE (approval_status_filter IS NULL OR p.approval_status = approval_status_filter)
        AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
        AND (search_term IS NULL OR 
             p.title ILIKE '%' || search_term || '%' OR 
             p.city ILIKE '%' || search_term || '%' OR
             p.country ILIKE '%' || search_term || '%' OR
             h.name ILIKE '%' || search_term || '%');
    
    -- Get paginated data with host info
    SELECT json_agg(
        json_build_object(
            'id', p.id,
            'title', p.title,
            'description', p.description,
            'property_type', p.property_type,
            'city', p.city,
            'country', p.country,
            'latitude', p.latitude,
            'longitude', p.longitude,
            'base_price', p.base_price,
            'currency', p.currency,
            'max_guests', p.max_guests,
            'bedrooms', p.bedrooms,
            'bathrooms', p.bathrooms,
            'images', p.images,
            'amenities', p.amenities,
            'approval_status', p.approval_status,
            'admin_notes', p.admin_notes,
            'rejection_reason', p.rejection_reason,
            'view_count', p.view_count,
            'booking_count', p.booking_count,
            'average_rating', p.average_rating,
            'total_revenue', p.total_revenue,
            'is_active', p.is_active,
            'is_featured', p.is_featured,
            'created_at', p.created_at,
            'host', json_build_object(
                'id', h.id,
                'name', h.name,
                'email', h.email,
                'avatar_url', h.avatar_url,
                'average_rating', h.average_rating,
                'total_properties', h.total_properties,
                'join_date', h.join_date
            )
        ) ORDER BY 
            CASE WHEN sort_by = 'title' AND sort_direction = 'ASC' THEN p.title END ASC,
            CASE WHEN sort_by = 'title' AND sort_direction = 'DESC' THEN p.title END DESC,
            CASE WHEN sort_by = 'created_at' AND sort_direction = 'ASC' THEN p.created_at END ASC,
            CASE WHEN sort_by = 'created_at' AND sort_direction = 'DESC' THEN p.created_at END DESC,
            CASE WHEN sort_by = 'revenue' AND sort_direction = 'ASC' THEN p.total_revenue END ASC,
            CASE WHEN sort_by = 'revenue' AND sort_direction = 'DESC' THEN p.total_revenue END DESC
    ) INTO properties_data
    FROM (
        SELECT p.*, ROW_NUMBER() OVER (
            ORDER BY 
                CASE WHEN sort_by = 'title' AND sort_direction = 'ASC' THEN p.title END ASC,
                CASE WHEN sort_by = 'title' AND sort_direction = 'DESC' THEN p.title END DESC,
                CASE WHEN sort_by = 'created_at' AND sort_direction = 'ASC' THEN p.created_at END ASC,
                CASE WHEN sort_by = 'created_at' AND sort_direction = 'DESC' THEN p.created_at END DESC,
                CASE WHEN sort_by = 'revenue' AND sort_direction = 'ASC' THEN p.total_revenue END ASC,
                CASE WHEN sort_by = 'revenue' AND sort_direction = 'DESC' THEN p.total_revenue END DESC
        ) as rn
        FROM properties p
        JOIN users h ON p.host_id = h.id
        WHERE (approval_status_filter IS NULL OR p.approval_status = approval_status_filter)
            AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
            AND (search_term IS NULL OR 
                 p.title ILIKE '%' || search_term || '%' OR 
                 p.city ILIKE '%' || search_term || '%' OR
                 p.country ILIKE '%' || search_term || '%' OR
                 h.name ILIKE '%' || search_term || '%')
    ) p
    JOIN users h ON p.host_id = h.id
    WHERE p.rn BETWEEN offset_val + 1 AND offset_val + page_size;
    
    RETURN json_build_object(
        'data', COALESCE(properties_data, '[]'::json),
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

### 4. Booking Management

#### `get_paginated_bookings_admin()`
**Purpose**: Comprehensive booking management with financial details
```sql
CREATE OR REPLACE FUNCTION get_paginated_bookings_admin(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20,
    booking_status_filter booking_status_enum DEFAULT NULL,
    payment_status_filter payment_status_enum DEFAULT NULL,
    date_from DATE DEFAULT NULL,
    date_to DATE DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    offset_val INTEGER := (page_num - 1) * page_size;
    total_count INTEGER;
    bookings_data JSON;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM bookings b
    JOIN properties p ON b.property_id = p.id
    JOIN users g ON b.guest_id = g.id
    JOIN users h ON b.host_id = h.id
    WHERE (booking_status_filter IS NULL OR b.booking_status = booking_status_filter)
        AND (payment_status_filter IS NULL OR b.payment_status = payment_status_filter)
        AND (date_from IS NULL OR b.check_in_date >= date_from)
        AND (date_to IS NULL OR b.check_out_date <= date_to)
        AND (search_term IS NULL OR 
             p.title ILIKE '%' || search_term || '%' OR 
             g.name ILIKE '%' || search_term || '%' OR
             h.name ILIKE '%' || search_term || '%');
    
    -- Get paginated bookings with related data
    SELECT json_agg(
        json_build_object(
            'id', b.id,
            'check_in_date', b.check_in_date,
            'check_out_date', b.check_out_date,
            'number_of_guests', b.number_of_guests,
            'number_of_nights', b.number_of_nights,
            'base_amount', b.base_amount,
            'cleaning_fee', b.cleaning_fee,
            'service_fee', b.service_fee,
            'taxes', b.taxes,
            'total_amount', b.total_amount,
            'host_payout', b.host_payout,
            'platform_fee', b.platform_fee,
            'booking_status', b.booking_status,
            'payment_status', b.payment_status,
            'payment_method', b.payment_method,
            'special_requests', b.special_requests,
            'cancellation_reason', b.cancellation_reason,
            'refund_amount', b.refund_amount,
            'created_at', b.created_at,
            'property', json_build_object(
                'id', p.id,
                'title', p.title,
                'images', p.images[1:1],
                'city', p.city,
                'country', p.country
            ),
            'guest', json_build_object(
                'id', g.id,
                'name', g.name,
                'email', g.email,
                'phone', g.phone,
                'avatar_url', g.avatar_url
            ),
            'host', json_build_object(
                'id', h.id,
                'name', h.name,
                'email', h.email,
                'phone', h.phone,
                'avatar_url', h.avatar_url
            )
        ) ORDER BY b.created_at DESC
    ) INTO bookings_data
    FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM bookings b
        WHERE (booking_status_filter IS NULL OR b.booking_status = booking_status_filter)
            AND (payment_status_filter IS NULL OR b.payment_status = payment_status_filter)
            AND (date_from IS NULL OR b.check_in_date >= date_from)
            AND (date_to IS NULL OR b.check_out_date <= date_to)
    ) b
    JOIN properties p ON b.property_id = p.id
    JOIN users g ON b.guest_id = g.id
    JOIN users h ON b.host_id = h.id
    WHERE b.rn BETWEEN offset_val + 1 AND offset_val + page_size
        AND (search_term IS NULL OR 
             p.title ILIKE '%' || search_term || '%' OR 
             g.name ILIKE '%' || search_term || '%' OR
             h.name ILIKE '%' || search_term || '%');
    
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

---

## ⚡ Edge Functions

### 1. Essential Admin Functions (Phase 1)

#### Real-time Admin Notifications
**File**: `supabase/functions/admin-notifications/index.ts`
**Purpose**: Handle real-time notifications for admin events

```typescript
// Triggered on booking status changes, user registrations, property submissions
// Sends real-time updates to admin dashboard
// Basic email notifications
```

#### Property Approval Workflow
**File**: `supabase/functions/property-approval/index.ts`
**Purpose**: Basic property approval workflow

```typescript
// Basic image validation
// Admin notification triggers
// Status update automation
```

### 2. Future Admin Functions (Phase 2 - Commented Out)

<!-- 
### Financial Reports Generator
**File**: `supabase/functions/generate-financial-reports/index.ts`
**Purpose**: Generate comprehensive financial reports

```typescript
// Monthly/quarterly revenue reports
// Tax documentation
// Host payout calculations
// Commission tracking
```

### Dispute Resolution System
**File**: `supabase/functions/dispute-management/index.ts`
**Purpose**: Automated dispute handling and escalation

```typescript
// Priority assignment based on dispute type
// Auto-escalation rules
// Communication templates
// Resolution tracking
```
-->

---

## 🚀 Performance Optimization

### 1. Database Optimizations

#### Indexing Strategy
```sql
-- Compound indexes for common admin queries
CREATE INDEX idx_properties_admin_filter ON properties(approval_status, created_at DESC) 
WHERE approval_status = 'pending';

CREATE INDEX idx_bookings_admin_dashboard ON bookings(booking_status, payment_status, created_at DESC);

CREATE INDEX idx_users_admin_filter ON users(account_status, user_role, created_at DESC) 
WHERE user_role != 'admin';

-- Full-text search indexes
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', name || ' ' || email));
```

#### Materialized Views for Analytics
```sql
-- Daily revenue aggregate
CREATE MATERIALIZED VIEW daily_revenue_stats AS
SELECT 
    DATE(created_at) as date,
    SUM(platform_fee) as total_revenue,
    COUNT(*) as booking_count,
    AVG(total_amount) as avg_booking_value
FROM bookings 
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Refresh daily via cron job
```

### 2. Caching Strategy

#### Redis Implementation
- **Dashboard stats**: Cache for 5 minutes
- **User lists**: Cache paginated results for 2 minutes
- **Property analytics**: Cache for 15 minutes
- **Financial reports**: Cache for 1 hour

#### Supabase Realtime Optimization
```sql
-- Enable realtime only for critical admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE disputes;
```

### 3. Query Optimization Tips

#### Batch Operations
- Use bulk user actions for suspensions/activations
- Batch notification sending
- Grouped property approvals

#### Pagination Best Practices
- Use cursor-based pagination for large datasets
- Implement infinite scroll for better UX
- Pre-calculate total counts for first page only

---

## 🔒 Security & RLS Policies

### Row Level Security Implementation

#### Admin Access Control
```sql
-- Admins can access all user data
CREATE POLICY admin_users_all ON users
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'super_admin') OR
        auth.uid() = id
    );

-- Property management access
CREATE POLICY admin_properties_all ON properties
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'super_admin') OR
        host_id = auth.uid()
    );

-- Booking oversight access
CREATE POLICY admin_bookings_all ON bookings
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'super_admin') OR
        guest_id = auth.uid() OR
        host_id = auth.uid()
    );
```

#### Audit Trail Protection
```sql
-- Only admins can read audit logs
CREATE POLICY admin_activities_read ON admin_activities
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Prevent modification of audit logs
CREATE POLICY admin_activities_insert_only ON admin_activities
    FOR INSERT TO authenticated
    WITH CHECK (admin_id = auth.uid() AND auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
```

---

## 📊 Functions Requiring Pagination

### High-Volume Data Functions
1. **`get_paginated_users()`** - User management (20/page)
2. **`get_paginated_properties_admin()`** - Property listings (20/page)
3. **`get_paginated_bookings_admin()`** - Booking management (20/page)
4. **`get_paginated_disputes()`** - Dispute management (15/page)
5. **`get_admin_activities()`** - Audit logs (25/page)
6. **`get_financial_transactions()`** - Financial records (30/page)
7. **`get_notifications_admin()`** - System notifications (20/page)
8. **`get_property_reviews_admin()`** - Review management (25/page)

### Performance Targets
- **Page load time**: < 200ms for dashboard
- **Search results**: < 300ms with full-text search
- **Bulk operations**: < 2s for 100 items
- **Real-time updates**: < 100ms latency

---

## 🔗 API Integration Points

### Required External Services
1. **Payment Processing**: Stripe Connect for host payouts
2. **Image Moderation**: AWS Rekognition for content filtering
3. **Email Service**: SendGrid for notifications
4. **SMS Service**: Twilio for urgent notifications
5. **File Storage**: Supabase Storage with CDN
6. **Maps**: Google Maps API for location validation

### Webhook Handlers
- Payment confirmation webhooks
- Property image upload processing
- User verification status updates
- Dispute escalation triggers

This documentation provides the foundation for implementing a robust, scalable admin panel with Supabase, focusing on performance, security, and maintainability. 