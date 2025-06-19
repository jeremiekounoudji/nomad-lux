# Property Detail Page - NomadLux

## Overview
The PropertyDetail page provides a comprehensive view of individual properties with detailed information, host details, booking functionality, and location mapping.

## Features

### 1. Image Gallery
- **Main Image Display**: Large hero image with navigation controls
- **Thumbnail Strip**: Clickable thumbnails for quick image navigation
- **Image Counter**: Shows current image position (e.g., "3 / 8")
- **Navigation Buttons**: Left/right arrows for image browsing
- **Responsive Design**: Adapts to different screen sizes

### 2. Property Information
- **Title & Location**: Property name and location details
- **Rating & Reviews**: Star rating with review count
- **Property Stats**: Guests, bedrooms, bathrooms count
- **Description**: Detailed property description (left-aligned)
- **Amenities Grid**: Visual amenity list with icons

### 3. Host Information Section
- **Host Profile**: Avatar, name, and join date
- **Host Stats**: Rating and verification status
- **Host Bio**: Personal description and background
- **Contact Button**: Direct host communication option

### 4. Booking Card (Sticky Sidebar)
- **Price Display**: Nightly rate with rating summary
- **Date Selection**: Check-in and check-out date pickers
- **Guest Selection**: Dropdown for number of guests
- **Reserve Button**: Primary booking action
- **Price Breakdown**: Detailed cost calculation
  - Nightly rate × number of nights
  - Cleaning fee
  - Service fee
  - Total before taxes

### 5. Map Section
- **Location Preview**: Map placeholder with property location
- **Address Display**: City and country information
- **Interactive Map**: (Placeholder for future implementation)

## Technical Implementation

### Component Structure
```tsx
PropertyDetailPage
├── Header (Back button, Like, Share)
├── Main Content (2/3 width on desktop)
│   ├── Image Gallery
│   ├── Property Info
│   ├── Host Info
│   └── Map Section
└── Booking Card (1/3 width, sticky)
```

### Props Interface
```tsx
interface PropertyDetailPageProps {
  property: Property
  onBack: () => void
}
```

### State Management
```tsx
const [currentImageIndex, setCurrentImageIndex] = useState(0)
const [checkIn, setCheckIn] = useState('')
const [checkOut, setCheckOut] = useState('')
const [guests, setGuests] = useState(1)
const [isLiked, setIsLiked] = useState(property.isLiked)
```

## Navigation Flow

### From Property Card
1. User clicks on PropertyCard in the feed
2. `onClick` handler triggers with property data
3. HomePage state updates to show PropertyDetailPage
4. PropertyDetailPage renders with full property information

### Back Navigation
1. User clicks back arrow in header
2. `onBack` handler triggers
3. HomePage state resets to show property feed
4. User returns to main feed view

## Responsive Design

### Desktop (lg: 1024px+)
- **Layout**: Two-column grid (2/3 content, 1/3 booking card)
- **Booking Card**: Sticky positioning for easy access
- **Image Gallery**: Large hero image (500px height)
- **Navigation**: Full-width header with back button

### Tablet (md: 768px - 1023px)
- **Layout**: Single column with booking card below content
- **Image Gallery**: Medium hero image (400px height)
- **Booking Card**: Full-width, non-sticky

### Mobile (< 768px)
- **Layout**: Single column, stacked sections
- **Image Gallery**: Smaller hero image (300px height)
- **Booking Card**: Full-width at bottom
- **Touch Navigation**: Optimized for mobile interaction

## Styling & Colors

### Primary Elements
- **Reserve Button**: `bg-primary-600` with hover state
- **Host Verification**: `bg-primary-500` for verified badge
- **Active Thumbnail**: `border-primary-500` for selected image

### Interactive Elements
- **Navigation Buttons**: White background with shadow
- **Action Buttons**: Hover states with color transitions
- **Form Elements**: Clean borders with focus states

## Data Requirements

### Extended Property Interface
```tsx
interface Property {
  // ... existing fields
  videos?: string[]           // Video media support
  cleaningFee?: number       // Booking calculation
  serviceFee?: number        // Booking calculation
  totalBeforeTaxes?: number  // Booking calculation
  location: {
    address?: string         // Detailed address
    // ... existing location fields
  }
}
```

### Host Information
- Profile image and basic info
- Verification status
- Bio and description
- Contact capabilities

## Future Enhancements

### Video Support
- Video gallery integration
- Video thumbnail previews
- Video playback controls

### Interactive Map
- Real map integration (Google Maps/Mapbox)
- Property location marker
- Nearby amenities and attractions
- Street view integration

### Enhanced Booking
- Real-time availability checking
- Dynamic pricing based on dates
- Instant booking vs. request to book
- Calendar integration

### Reviews Section
- Guest review display
- Rating breakdown by category
- Review filtering and sorting
- Photo reviews from guests

## Usage Example

```tsx
// In HomePage component
const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

const handlePropertyClick = (property: Property) => {
  setSelectedProperty(property)
}

const handleBackToHome = () => {
  setSelectedProperty(null)
}

if (selectedProperty) {
  return (
    <PropertyDetailPage 
      property={selectedProperty} 
      onBack={handleBackToHome}
    />
  )
}

// Render property feed with clickable cards
<PropertyCard
  property={property}
  onClick={handlePropertyClick}
  // ... other props
/>
```

This implementation provides a comprehensive property viewing experience that matches modern vacation rental platforms while maintaining the luxury aesthetic of NomadLux. 