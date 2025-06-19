# Responsive Layout System - NomadLux

## Overview
NomadLux uses a responsive layout system inspired by Instagram's design, featuring a desktop sidebar and responsive grid layout for property cards.

## Layout Structure

### Desktop (lg: 1024px+)
- **Sidebar**: Fixed left sidebar (256px/288px wide) with profile and navigation
- **Main Content**: Flexible content area with top search bar
- **Grid**: 3-column grid for property cards
- **Typography**: Gothic font (Cinzel) for branding

### Tablet (md: 768px - 1023px)
- **No Sidebar**: Full-width layout
- **Mobile Header**: Sticky header with logo and menu
- **Grid**: 2-column grid for property cards
- **Bottom Navigation**: Hidden on tablet

### Mobile (< 768px)
- **No Sidebar**: Full-width layout
- **Mobile Header**: Sticky header with logo and menu
- **Grid**: Single column layout
- **Bottom Navigation**: Fixed bottom navigation bar

## Color Scheme

### Primary Colors (Pink/Magenta)
```css
primary-50: #fdf2f8   /* Very light pink */
primary-100: #fce7f3  /* Light pink */
primary-200: #fbcfe8  /* Soft pink */
primary-300: #f9a8d4  /* Medium pink */
primary-400: #f472b6  /* Bright pink */
primary-500: #ec4899  /* Main primary */
primary-600: #db2777  /* Dark pink */
primary-700: #be185d  /* Darker pink */
primary-800: #9d174d  /* Very dark pink */
primary-900: #831843  /* Deepest pink */
```

### Secondary Colors (Blue)
```css
secondary-50: #f0f9ff   /* Very light blue */
secondary-100: #e0f2fe  /* Light blue */
secondary-200: #bae6fd  /* Soft blue */
secondary-300: #7dd3fc  /* Medium blue */
secondary-400: #38bdf8  /* Bright blue */
secondary-500: #0ea5e9  /* Main secondary */
secondary-600: #0284c7  /* Dark blue */
secondary-700: #0369a1  /* Darker blue */
secondary-800: #075985  /* Very dark blue */
secondary-900: #0c4a6e  /* Deepest blue */
```

## Components

### Sidebar (Desktop Only)
- **Profile Section**: User avatar, name, stats
- **Primary Navigation**: Home, Search, Liked, Create, Bookings, Profile
- **Secondary Navigation**: Saved, Settings, Help, Privacy
- **Logout**: Bottom logout button

### MainLayout
- **Responsive Container**: Handles sidebar and main content
- **Grid System**: Automatic responsive grid (1/2/3 columns)
- **Sticky Elements**: Headers and navigation bars

### PropertyCard
- **Responsive Height**: Adjusts image height based on screen size
- **Hover Effects**: Shadow and scale transitions
- **Action Buttons**: Like, share, bookmark with primary colors

## Grid System

### CSS Grid Classes
```css
/* Mobile: 1 column */
grid-cols-1

/* Tablet: 2 columns */
md:grid-cols-2

/* Desktop: 3 columns */
lg:grid-cols-3
```

### Content Spanning
```css
/* Full width across all columns */
col-span-1 md:col-span-2 lg:col-span-3

/* Single column */
col-span-1
```

## Typography

### Font Families
- **Gothic (Branding)**: Cinzel - Used for "NomadLux" logo
- **Sans (Content)**: Inter - Used for all other text

### Usage
```css
font-gothic    /* For branding elements */
font-sans      /* For content text */
```

## Responsive Breakpoints

```css
/* Mobile */
< 768px: Single column, bottom nav, mobile header

/* Tablet */
768px - 1023px: Two columns, mobile header, no bottom nav

/* Desktop */
1024px+: Three columns, sidebar, top search bar
```

## Implementation Example

```tsx
<MainLayout currentPage="home">
  {/* Full width component */}
  <div className="col-span-1 md:col-span-2 lg:col-span-3">
    <PopularPlaces />
  </div>

  {/* Individual grid items */}
  {properties.map((property) => (
    <div key={property.id} className="col-span-1">
      <PropertyCard property={property} />
    </div>
  ))}
</MainLayout>
```

## Technical Details

### Sticky Positioning
- Desktop sidebar: `sticky top-0`
- Mobile header: `sticky top-0 z-40`
- Desktop search bar: `sticky top-0 z-40`

### Z-Index Layers
- Bottom navigation: `z-50`
- Headers: `z-40`
- Sidebar: Default stacking

### Transitions
- Color transitions: `transition-colors duration-200`
- All properties: `transition-all duration-200`
- Hover effects: `hover:shadow-md transition-shadow`

This layout system provides a modern, Instagram-inspired experience that adapts seamlessly across all device sizes while maintaining the luxury aesthetic of NomadLux. 