# 📚 Nomad Lux - Technical Architecture Book

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design](#api-design)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Routing Strategy](#routing-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)
12. [Deployment Strategy](#deployment-strategy)

---

## Project Overview

**Nomad Lux** is a mobile-first property listing and booking platform built with modern web technologies. The application follows an Instagram-inspired UI/UX pattern with a focus on visual content and seamless user interactions.

### Core Technologies
- **Frontend**: Vite.js + React + TypeScript
- **Styling**: Tailwind CSS + Hero UI
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **State Management**: Zustand
- **Maps**: Mapbox/Leaflet.js
- **Date Handling**: date-fns

---

## Frontend Architecture

### 🏗️ Architecture Pattern
The frontend follows a **Component-Based Architecture** with:
- **Atomic Design Principles**
- **Mobile-First Responsive Design**
- **Progressive Web App (PWA) Ready**

### 📱 Mobile-First Design Strategy
```typescript
// Tailwind breakpoints strategy
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices  
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
}

// Design approach: Mobile → Tablet → Desktop
```

### 🎨 UI Component Hierarchy
```
Components/
├── ui/              # Hero UI base components (Button, Input, etc.)
├── shared/          # Reusable custom components
│   ├── PropertyCard/
│   ├── SearchBar/
│   ├── DatePicker/
│   ├── MediaUpload/
│   └── PriceDisplay/
├── features/        # Feature-specific components
│   ├── auth/        # Authentication components
│   ├── property/    # Property-related components
│   ├── booking/     # Booking components
│   └── admin/       # Admin panel components
├── layout/          # Layout components
│   ├── MainLayout/
│   ├── AuthLayout/
│   ├── AdminLayout/
│   └── Navigation/
└── pages/           # Page-level components
    ├── HomePage/
    ├── PropertyPage/
    └── BookingPage/
```

---

## Backend Architecture

### 🔥 Firebase Architecture
```
Firebase Services:
├── Authentication    # User management & auth
├── Firestore        # NoSQL database
├── Storage          # File/media storage
├── Functions        # Serverless functions
├── Hosting          # Static site hosting
└── Analytics        # User behavior tracking
```

### 🗄️ Firestore Database Structure
```javascript
// Collections Structure
{
  users: {
    [userId]: {
      email: string,
      displayName: string,
      role: 'user' | 'admin',
      createdAt: timestamp,
      profile: {
        phone: string,
        avatar: string,
        preferences: object
      }
    }
  },
  
  properties: {
    [propertyId]: {
      hostId: string,
      title: string,
      description: string,
      type: 'apartment' | 'house' | 'villa',
      price: number,
      location: {
        lat: number,
        lng: number,
        address: string,
        city: string,
        country: string
      },
      amenities: string[],
      media: {
        images: string[],
        videos: string[]
      },
      status: 'pending' | 'approved' | 'rejected',
      createdAt: timestamp,
      updatedAt: timestamp
    }
  },
  
  bookings: {
    [bookingId]: {
      propertyId: string,
      userId: string,
      hostId: string,
      checkIn: timestamp,
      checkOut: timestamp,
      totalPrice: number,
      status: 'pending' | 'accepted' | 'rejected' | 'cancelled',
      paymentStatus: 'pending' | 'paid' | 'refunded',
      createdAt: timestamp
    }
  },
  
  likes: {
    [likeId]: {
      userId: string,
      propertyId: string,
      createdAt: timestamp
    }
  }
}
```

---

## Authentication & Authorization

### 🔐 Firebase Auth Implementation
```typescript
// Auth service structure
interface AuthService {
  signUp(email: string, password: string): Promise<User>
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  updateProfile(data: ProfileData): Promise<void>
}

// Role-based access control
enum UserRole {
  GUEST = 'guest',
  USER = 'user', 
  ADMIN = 'admin'
}

// Permission matrix
const permissions = {
  [UserRole.GUEST]: ['view_properties'],
  [UserRole.USER]: ['view_properties', 'like_properties', 'book_properties', 'add_properties'],
  [UserRole.ADMIN]: ['*'] // All permissions
}
```

---

## API Design

### 🔌 Firebase Functions API
```typescript
// Cloud Functions structure
functions/
├── auth/
│   ├── onUserCreate.ts      # User profile creation
│   └── onUserDelete.ts      # Cleanup on user deletion
├── properties/
│   ├── approveProperty.ts   # Admin approval
│   ├── searchProperties.ts  # Advanced search
│   └── getTopProperties.ts  # Trending algorithm
├── bookings/
│   ├── createBooking.ts     # Booking creation
│   ├── processPayment.ts    # Payment processing
│   └── sendNotifications.ts # Booking notifications
└── utils/
    ├── imageProcessing.ts   # Image optimization
    └── emailService.ts      # Email notifications
```

### 📡 API Endpoints
```typescript
// RESTful API design
const apiEndpoints = {
  // Properties
  'GET /api/properties': 'List properties with filters',
  'GET /api/properties/:id': 'Get property details',
  'POST /api/properties': 'Create new property',
  'PUT /api/properties/:id': 'Update property',
  'DELETE /api/properties/:id': 'Delete property',
  
  // Bookings
  'GET /api/bookings': 'List user bookings',
  'POST /api/bookings': 'Create booking',
  'PUT /api/bookings/:id': 'Update booking status',
  
  // Admin
  'GET /api/admin/properties': 'List pending properties',
  'PUT /api/admin/properties/:id/approve': 'Approve property',
  'GET /api/admin/users': 'List all users',
  'GET /api/admin/bookings': 'List all bookings'
}
```

---

## State Management

### 🏪 Zustand Store Architecture
```typescript
// Store structure
interface AppState {
  // Auth state
  auth: {
    user: User | null
    isLoading: boolean
    error: string | null
  }
  
  // Properties state
  properties: {
    items: Property[]
    topProperties: Property[]
    nearbyProperties: Property[]
    likedProperties: Property[]
    isLoading: boolean
    filters: PropertyFilters
  }
  
  // Bookings state
  bookings: {
    userBookings: Booking[]
    isLoading: boolean
    selectedDates: DateRange | null
  }
  
  // UI state
  ui: {
    bottomNavVisible: boolean
    currentPage: string
    modals: {
      booking: boolean
      auth: boolean
    }
  }
}
```

---

## Component Architecture

### 🧩 Key Components Design

#### PropertyCard Component
```typescript
interface PropertyCardProps {
  property: Property
  variant: 'grid' | 'list' | 'story'
  onLike: (propertyId: string) => void
  onShare: (property: Property) => void
  onBook: (property: Property) => void
}

// Usage patterns:
// - Story view: Horizontal scroll, Instagram-like
// - Grid view: 2-column mobile, 3-4 column desktop
// - List view: Vertical stack with more details
```

#### BookingForm Component
```typescript
interface BookingFormProps {
  property: Property
  onSubmit: (bookingData: BookingData) => void
  availableDates: Date[]
  pricing: PricingCalculator
}

// Features:
// - Date range picker
// - Real-time price calculation
// - Availability checking
// - Guest count selection
```

---

## Routing Strategy

### 🛣️ React Router Implementation
```typescript
// Route structure
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'property/:id', element: <PropertyDetailPage /> },
      { path: 'add-property', element: <AddPropertyPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'liked', element: <LikedPropertiesPage /> }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'properties', element: <AdminPropertiesPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> }
    ]
  }
]
```

---

## Performance Optimization

### ⚡ Frontend Optimization
```typescript
// Code splitting strategy
const LazyPropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const LazyAdminPanel = lazy(() => import('./pages/AdminPanel'))

// Image optimization
const ImageOptimization = {
  formats: ['webp', 'avif', 'jpg'],
  sizes: [320, 640, 960, 1280],
  quality: 80,
  lazy: true
}

// Bundle optimization
const bundleStrategy = {
  vendor: ['react', 'react-dom', 'firebase'],
  common: ['utils', 'hooks', 'context'],
  pages: 'dynamic-imports'
}
```

### 🔥 Firebase Optimization
```typescript
// Firestore query optimization
const optimizedQueries = {
  // Use composite indexes
  getTopProperties: () => 
    query(
      collection(db, 'properties'),
      where('status', '==', 'approved'),
      orderBy('likes', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(20)
    ),
  
  // Pagination for large datasets
  getNearbyProperties: (lastDoc: DocumentSnapshot) =>
    query(
      collection(db, 'properties'),
      where('location.city', '==', userCity),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(10)
    )
}
```

---

## Security Considerations

### 🔒 Security Implementation
```typescript
// Firestore Security Rules
const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties are readable by all, writable by owner or admin
    match /properties/{propertyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.hostId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Bookings are private to involved parties
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.hostId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
`;

// Input validation
const validation = {
  sanitizeInput: (input: string) => DOMPurify.sanitize(input),
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePrice: (price: number) => price > 0 && price < 10000,
  validateDates: (checkIn: Date, checkOut: Date) => checkIn < checkOut
}
```

---

## Deployment Strategy

### 🚀 CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy Nomad Lux
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: nomad-lux
```

### 🌐 Environment Configuration
```typescript
// Environment setup
const environments = {
  development: {
    apiUrl: 'http://localhost:5173',
    firebase: {
      projectId: 'nomad-lux-dev',
      apiKey: process.env.VITE_FIREBASE_API_KEY_DEV
    }
  },
  staging: {
    apiUrl: 'https://staging.nomadlux.com',
    firebase: {
      projectId: 'nomad-lux-staging',
      apiKey: process.env.VITE_FIREBASE_API_KEY_STAGING
    }
  },
  production: {
    apiUrl: 'https://nomadlux.com',
    firebase: {
      projectId: 'nomad-lux-prod',
      apiKey: process.env.VITE_FIREBASE_API_KEY_PROD
    }
  }
}
```

---

## Development Guidelines

### 📝 Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### 🧪 Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress
- **E2E Tests**: Playwright
- **Performance Tests**: Lighthouse CI

### 📊 Monitoring & Analytics
- **Error Tracking**: Sentry
- **Performance**: Firebase Performance
- **Analytics**: Firebase Analytics
- **User Feedback**: Hotjar

---

This technical architecture book serves as the foundation for building and maintaining the Nomad Lux platform. Each section should be referenced during development to ensure consistency and best practices across the entire application. 