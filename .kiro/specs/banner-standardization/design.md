# Banner Standardization Design Document

## Overview

This design document outlines the implementation approach for standardizing all page banners in the Nomad Lux application to use a consistent Image + Overlay pattern with black transparent overlays. The design ensures visual consistency while maintaining functionality and accessibility.

## Architecture

### Component Structure
```
Banner Component
├── Background Image Layer
├── Black Transparent Overlay Layer
├── Content Layer (Text, Buttons, etc.)
└── Responsive Container
```

### Design Pattern
All banners will follow this consistent structure:
1. **Background Image**: Contextually relevant, high-quality images
2. **Overlay**: Black transparent overlay (`bg-black/60` to `bg-black/70`)
3. **Content**: White text and elements for optimal contrast
4. **Responsive Design**: Mobile-first approach with breakpoint-specific adjustments

## Components and Interfaces

### Banner Component Props
```typescript
interface BannerProps {
  backgroundImage: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  overlayOpacity?: 'light' | 'medium' | 'dark' // bg-black/50, bg-black/60, bg-black/70
  height?: 'small' | 'medium' | 'large'
  className?: string
}
```

### Image Configuration
```typescript
interface BannerImageConfig {
  src: string
  alt: string
  fallbackColor: string
  loading: 'lazy' | 'eager'
  sizes: string
}
```

## Data Models

### Page-Specific Banner Configurations
```typescript
const BANNER_CONFIGS = {
  notifications: {
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80',
    alt: 'Notifications and alerts background',
    overlayOpacity: 'medium'
  },
  createProperty: {
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern house architecture background',
    overlayOpacity: 'medium'
  },
  myListings: {
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
    alt: 'Property management background',
    overlayOpacity: 'medium'
  },
  myBookings: {
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    alt: 'Travel and booking background',
    overlayOpacity: 'medium'
  },
  likedProperties: {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Favorite properties background',
    overlayOpacity: 'medium'
  },
  bookingRequests: {
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    alt: 'Communication and requests background',
    overlayOpacity: 'medium'
  },
  search: {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Property search and discovery background',
    overlayOpacity: 'medium'
  }
}
```

## Error Handling

### Image Loading Failures
- **Fallback Strategy**: Use solid color background with same overlay
- **Loading States**: Show skeleton/placeholder during image load
- **Error Logging**: Log failed image loads for monitoring

### Responsive Breakpoints
- **Mobile**: `< 640px` - Smaller padding, adjusted text sizes
- **Tablet**: `640px - 1024px` - Medium spacing and text
- **Desktop**: `> 1024px` - Full spacing and larger text

## Testing Strategy

### Visual Regression Testing
1. **Screenshot Comparison**: Automated visual testing for each banner
2. **Cross-Browser Testing**: Ensure consistency across browsers
3. **Device Testing**: Test on various screen sizes and orientations

### Performance Testing
1. **Image Loading**: Measure image load times and optimization
2. **Layout Shift**: Ensure minimal CLS during banner rendering
3. **Memory Usage**: Monitor memory consumption with multiple banners

### Accessibility Testing
1. **Contrast Ratios**: Verify WCAG AA compliance for text contrast
2. **Screen Reader**: Test with screen readers for proper content access
3. **Keyboard Navigation**: Ensure all interactive elements are accessible

## Implementation Approach

### Phase 1: Create Reusable Banner Component
1. Build generic `PageBanner` component with image + overlay pattern
2. Implement responsive design with Tailwind CSS
3. Add proper TypeScript interfaces and props
4. Include accessibility features (ARIA labels, alt text)

### Phase 2: Update Existing Pages
1. **NotificationsPage**: Replace gradient banner with image + overlay
2. **CreatePropertyPage**: Update to use new banner component
3. **MyListingsPage**: Convert gradient to image + overlay
4. **MyBookingsPage**: Update banner implementation
5. **LikedPropertiesPage**: Standardize existing image banner
6. **BookingRequestsPage**: Standardize existing image banner
7. **SearchPage**: Update to use consistent overlay pattern

### Phase 3: Add Banners to Pages Without Them
1. **HomePage**: Add contextual banner for property discovery
2. **WalletPage**: Add financial/wallet themed banner
3. **AdminPage**: Add admin dashboard themed banner
4. **Other Pages**: Evaluate need for banners on remaining pages

### Phase 4: Optimization and Polish
1. **Image Optimization**: Implement lazy loading and responsive images
2. **Performance Tuning**: Optimize bundle size and loading performance
3. **Accessibility Audit**: Comprehensive accessibility review
4. **Cross-browser Testing**: Ensure compatibility across all browsers

## Technical Specifications

### CSS Classes Structure
```css
.page-banner {
  @apply relative overflow-hidden;
  min-height: 200px; /* Mobile */
}

.page-banner-image {
  @apply absolute inset-0 w-full h-full object-cover;
}

.page-banner-overlay {
  @apply absolute inset-0 bg-black/60;
}

.page-banner-content {
  @apply relative z-10 p-4 sm:p-6 lg:p-8 text-white;
}

@media (min-width: 640px) {
  .page-banner {
    min-height: 240px;
  }
}

@media (min-width: 1024px) {
  .page-banner {
    min-height: 280px;
  }
}
```

### Image Optimization Strategy
1. **Format**: Use WebP with JPEG fallback
2. **Sizes**: Multiple sizes for different screen densities
3. **Loading**: Lazy loading for non-critical banners
4. **Compression**: Optimize for web without quality loss
5. **CDN**: Use image CDN for optimal delivery

## Accessibility Considerations

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus states for interactive elements
- **Alt Text**: Descriptive alt text for all background images
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for banner sections
- **Skip Links**: Allow users to skip banner content if needed
- **Content Structure**: Logical reading order for banner content

## Performance Considerations

### Image Loading Strategy
1. **Critical Banners**: Load immediately (above-fold)
2. **Non-Critical**: Lazy load with intersection observer
3. **Preloading**: Preload critical banner images
4. **Caching**: Implement proper browser caching headers

### Bundle Size Impact
- **Component Size**: Keep banner component lightweight
- **Image Assets**: Optimize and compress all banner images
- **CSS Impact**: Minimal additional CSS overhead
- **JavaScript**: Efficient image loading and error handling