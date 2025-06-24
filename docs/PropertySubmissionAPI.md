# 🏠 Property Submission & Approval API Documentation

## Overview
This document outlines the API endpoints and data structures for property submission and approval in the Nomad Lux platform. Following best practices, we use:
- Direct Supabase client calls for all insert/update/delete operations
- RPC functions only for complex GET queries with filters


## Database Schema

### Properties Table
```sql
create table properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  price_per_night decimal not null,
  location jsonb not null,
  amenities text[] not null,
  images text[] not null,
  video text not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  rejection_reason text,
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id),
  
  -- Constraints
  constraint valid_status check (status in ('pending', 'approved', 'rejected')),
  constraint min_images check (array_length(images, 1) >= 4),
  constraint valid_price check (price_per_night > 0)
);

-- Enable RLS
alter table properties enable row level security;

-- RLS Policies
create policy "Users can view approved properties"
  on properties for select
  using (status = 'approved');

create policy "Hosts can view their own properties"
  on properties for select
  using (host_id = auth.uid());

create policy "Hosts can create properties"
  on properties for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update their pending properties"
  on properties for update
  using (host_id = auth.uid() and status = 'pending')
  with check (host_id = auth.uid() and status = 'pending');

create policy "Admins can manage all properties"
  on properties for all
  using (auth.jwt() ->> 'role' = 'admin');
```

## API Endpoints

### 1. Submit Property
Creates a new property listing in pending status using direct Supabase client call.

**Method:** Direct insert using Supabase client

**Example Usage:**
```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    title: 'Luxury Beach Villa',
    description: 'Beautiful beachfront property...',
    price_per_night: 250,
    location: {
      address: '123 Beach Road',
      city: 'Miami',
      country: 'USA',
      coordinates: { lat: 25.7617, lng: -80.1918 }
    },
    amenities: ['wifi', 'pool', 'parking'],
    images: [
      'url1.jpg', 'url2.jpg', 'url3.jpg', 'url4.jpg'
    ],
    video: 'video-url.mp4',
    status: 'pending'
  })
  .select()
  .single();
```

### 2. Get Property Details
Retrieves details of a specific property using direct Supabase client call.

**Method:** Direct select using Supabase client

**Example Usage:**
```typescript
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('id', propertyId)
  .single();
```

### 3. Update Pending Property
Updates a pending property listing using direct Supabase client call.

**Method:** Direct update using Supabase client

**Example Usage:**
```typescript
const { data, error } = await supabase
  .from('properties')
  .update({
    title: 'Updated Title',
    description: 'Updated description...',
    price_per_night: 300
  })
  .eq('id', propertyId)
  .eq('status', 'pending')
  .select()
  .single();
```

### 4. Approve Property
Approves a pending property using direct Supabase client call.

**Method:** Direct update using Supabase client

**Example Usage:**
```typescript
const { data, error } = await supabase
  .from('properties')
  .update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: user.id
  })
  .eq('id', propertyId)
  .eq('status', 'pending')
  .select()
  .single();
```

### 5. Reject Property
Rejects a pending property using direct Supabase client call.

**Method:** Direct update using Supabase client

**Example Usage:**
```typescript
const { data, error } = await supabase
  .from('properties')
  .update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    rejected_by: user.id,
    rejection_reason: reason
  })
  .eq('id', propertyId)
  .eq('status', 'pending')
  .select()
  .single();
```

### 6. List Properties by Status (Complex Query)
Lists properties filtered by status with advanced filtering options. This is implemented as an RPC function due to its complexity.

**Function Name:** `list_properties_by_status`

**Parameters:**
```typescript
{
  status: 'pending' | 'approved' | 'rejected';
  filters?: {
    priceRange?: { min: number; max: number };
    location?: { lat: number; lng: number; radius: number };
    amenities?: string[];
    dateRange?: { start: string; end: string };
  };
  page: number;      // Page number (optional, default: 1)
  per_page: number;  // Items per page (optional, default: 10)
  sort_by?: string;  // Sort field
  sort_order?: 'asc' | 'desc';
}
```

**Example Usage:**
```typescript
const { data, error } = await supabase
  .rpc('list_properties_by_status', {
    status: 'approved',
    filters: {
      priceRange: { min: 100, max: 500 },
      amenities: ['wifi', 'pool'],
      location: { lat: 25.7617, lng: -80.1918, radius: 10 }
    },
    page: 1,
    per_page: 10,
    sort_by: 'price_per_night',
    sort_order: 'asc'
  });
```

### 7. Search Properties (Complex Query)
Complex search functionality with multiple filters and sorting options. Implemented as an RPC function.

**Function Name:** `search_properties`

**Parameters:**
```typescript
{
  search_term?: string;
  filters: {
    priceRange?: { min: number; max: number };
    location?: { lat: number; lng: number; radius: number };
    amenities?: string[];
    dates?: { checkIn: string; checkOut: string };
    status?: string[];
    rating?: number;
  };
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page: number;
  per_page: number;
}
```

**Example Usage:**
```typescript
const { data, error } = await supabase
  .rpc('search_properties', {
    search_term: 'beach villa',
    filters: {
      priceRange: { min: 200, max: 1000 },
      location: { lat: 25.7617, lng: -80.1918, radius: 20 },
      amenities: ['pool', 'beach_access'],
      dates: {
        checkIn: '2024-07-01',
        checkOut: '2024-07-10'
      }
    },
    sort_by: 'rating',
    sort_order: 'desc',
    page: 1,
    per_page: 20
  });
```

## Error Handling

All functions return errors in the following format:
```typescript
{
  code: string;        // Error code
  message: string;     // Human-readable error message
  details?: any;       // Additional error details
}
```

Common error codes:
- `insufficient_permissions`: User doesn't have required permissions
- `invalid_input`: Invalid input parameters
- `not_found`: Property not found
- `invalid_status`: Invalid property status for operation
- `validation_error`: Data validation failed

## Webhooks

The following webhook events are available:

1. `property.submitted`: Triggered when a new property is submitted
2. `property.approved`: Triggered when a property is approved
3. `property.rejected`: Triggered when a property is rejected
4. `property.updated`: Triggered when a property is updated

Webhook payload example:
```typescript
{
  event: string;          // Event type
  property_id: string;    // Property ID
  timestamp: string;      // Event timestamp
  actor_id: string;       // User who triggered the event
  previous_status?: string; // Previous status (for status changes)
  new_status?: string;     // New status (for status changes)
}
```

## Rate Limits

- Property submission: 10 requests per hour per user
- Property updates: 20 requests per hour per property
- Property queries: 100 requests per minute per user

## Best Practices

1. **Image Handling:**
   - Upload images before property submission
   - Ensure minimum image dimensions (1200x800)
   - Maximum file size: 5MB per image
   - Supported formats: JPG, PNG, WebP

2. **Video Handling:**
   - Maximum video size: 50MB
   - Maximum duration: 2 minutes
   - Supported formats: MP4, WebM

3. **Location Data:**
   - Always validate coordinates
   - Use standardized country codes
   - Include full address details

4. **Error Handling:**
   - Implement proper error handling
   - Show user-friendly error messages
   - Log all API errors for debugging 