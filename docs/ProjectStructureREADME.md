# 📁 Nomad Lux - Project Structure Documentation

## Overview
This document outlines the complete folder structure and organization of the Nomad Lux project, following modern React/TypeScript best practices with a mobile-first, Instagram-inspired design approach.

## Root Directory Structure
```
nomad-lux/
├── docs/                           # 📚 Documentation files
│   ├── TechnicalArchitectureBook.md
│   ├── AuthenticationREADME.md
│   ├── BookingSystemREADME.md
│   ├── AdminPanelREADME.md
│   ├── UIComponentsREADME.md
│   ├── ProjectStructureREADME.md
│   ├── HeroUIComponentsREADME.md
│   ├── MigrationSummaryREADME.md
│   └── ProjectSetupREADME.md
├── public/                         # 🌐 Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── images/
├── src/                           # 💻 Source code
│   ├── components/                # 🧩 React components
│   │   ├── atoms/                 # Basic building blocks
│   │   ├── molecules/             # Simple combinations
│   │   ├── organisms/             # Complex sections
│   │   └── templates/             # Page layouts
│   ├── pages/                     # 📄 Route components
│   ├── hooks/                     # 🪝 Custom React hooks
│   ├── context/                   # 🌐 React Context providers
│   ├── lib/                       # 📚 Third-party integrations
│   ├── utils/                     # 🛠️ Utility functions
│   ├── firebase/                  # 🔥 Firebase configuration
│   ├── styles/                    # 🎨 Global styles
│   ├── assets/                    # 🖼️ Images, icons, fonts
│   ├── App.tsx                    # Main App component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global CSS
├── package.json                   # 📦 Dependencies and scripts
├── tsconfig.json                  # ⚙️ TypeScript configuration
├── tailwind.config.js             # 🎨 Tailwind CSS configuration
├── vite.config.ts                 # ⚡ Vite configuration
├── postcss.config.js              # 🎨 PostCSS configuration
└── README.md                      # 📖 Project documentation
```

## Detailed Source Structure

### Components Architecture (`src/components/`)

#### UI (`src/components/ui/`)
Hero UI base components imported and re-exported for consistency.

```
ui/
├── index.ts                       # Re-export Hero UI components
```

#### Shared (`src/components/shared/`)
Reusable custom components built on top of Hero UI.

```
shared/
├── PropertyCard/
│   ├── PropertyCard.tsx
│   ├── PropertyCard.types.ts
│   ├── PropertyCard.test.tsx
│   └── index.ts
├── SearchBar/
│   ├── SearchBar.tsx
│   ├── SearchBar.types.ts
│   ├── SearchBar.test.tsx
│   └── index.ts
├── DatePicker/
│   ├── DatePicker.tsx
│   ├── DatePicker.types.ts
│   └── index.ts
├── ImageUpload/
│   ├── ImageUpload.tsx
│   ├── ImageUpload.types.ts
│   └── index.ts
├── PriceDisplay/
│   ├── PriceDisplay.tsx
│   ├── PriceDisplay.types.ts
│   └── index.ts
└── index.ts                       # Export all shared components
```

#### Features (`src/components/features/`)
Feature-specific components organized by domain.

```
features/
├── auth/
│   ├── LoginForm/
│   ├── RegisterForm/
│   ├── ForgotPasswordForm/
│   └── index.ts
├── property/
│   ├── PropertyGrid/
│   ├── PropertyForm/
│   ├── PropertyFilters/
│   └── index.ts
├── booking/
│   ├── BookingForm/
│   ├── BookingCalendar/
│   ├── BookingCard/
│   └── index.ts
├── admin/
│   ├── AdminDashboard/
│   ├── UserManagement/
│   ├── PropertyApproval/
│   └── index.ts
└── index.ts                       # Export all feature components
```

#### Layout (`src/components/layout/`)
Layout components that define page structure.

```
layout/
├── MainLayout/
│   ├── MainLayout.tsx
│   ├── MainLayout.types.ts
│   └── index.ts
├── AuthLayout/
│   ├── AuthLayout.tsx
│   ├── AuthLayout.types.ts
│   └── index.ts
├── AdminLayout/
│   ├── AdminLayout.tsx
│   ├── AdminLayout.types.ts
│   └── index.ts
├── Navigation/
│   ├── NavigationBar.tsx
│   ├── MobileNavigation.tsx
│   └── index.ts
└── index.ts                       # Export all layout components
```

### Pages Structure (`src/pages/`)

```
pages/
├── Home/
│   ├── HomePage.tsx
│   ├── HomePage.types.ts
│   ├── HomePage.test.tsx
│   └── index.ts
├── Auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── index.ts
├── Property/
│   ├── PropertyDetailPage.tsx
│   ├── AddPropertyPage.tsx
│   ├── EditPropertyPage.tsx
│   └── index.ts
├── Booking/
│   ├── BookingsPage.tsx
│   ├── BookingDetailPage.tsx
│   └── index.ts
├── Profile/
│   ├── ProfilePage.tsx
│   ├── EditProfilePage.tsx
│   └── index.ts
├── Admin/
│   ├── AdminDashboard.tsx
│   ├── AdminUsersPage.tsx
│   ├── AdminPropertiesPage.tsx
│   ├── AdminBookingsPage.tsx
│   └── index.ts
├── Search/
│   ├── SearchPage.tsx
│   ├── SearchResultsPage.tsx
│   └── index.ts
└── index.ts                       # Export all pages
```

### Hooks Structure (`src/hooks/`)

```
hooks/
├── auth/
│   ├── useAuth.ts
│   ├── useAuthForm.ts
│   └── index.ts
├── property/
│   ├── useProperties.ts
│   ├── usePropertySearch.ts
│   ├── usePropertyForm.ts
│   └── index.ts
├── booking/
│   ├── useBookings.ts
│   ├── useBookingForm.ts
│   ├── useAvailability.ts
│   └── index.ts
├── ui/
│   ├── useModal.ts
│   ├── useToast.ts
│   ├── useLocalStorage.ts
│   └── index.ts
├── admin/
│   ├── useAdminData.ts
│   ├── useAdminPermissions.ts
│   └── index.ts
└── index.ts                       # Export all hooks
```

### Context Structure (`src/context/`)

```
context/
├── AuthContext/
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   ├── AuthContext.types.ts
│   └── index.ts
├── PropertyContext/
│   ├── PropertyContext.tsx
│   ├── PropertyProvider.tsx
│   ├── PropertyContext.types.ts
│   └── index.ts
├── BookingContext/
│   ├── BookingContext.tsx
│   ├── BookingProvider.tsx
│   ├── BookingContext.types.ts
│   └── index.ts
├── UIContext/
│   ├── UIContext.tsx
│   ├── UIProvider.tsx
│   ├── UIContext.types.ts
│   └── index.ts
└── index.ts                       # Export all contexts
```

### Firebase Structure (`src/firebase/`)

```
firebase/
├── config.ts                      # Firebase configuration
├── auth/
│   ├── authService.ts
│   ├── authTypes.ts
│   └── index.ts
├── firestore/
│   ├── collections.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── index.ts
├── storage/
│   ├── storageService.ts
│   ├── imageUpload.ts
│   └── index.ts
├── functions/
│   ├── bookingFunctions.ts
│   ├── propertyFunctions.ts
│   ├── userFunctions.ts
│   └── index.ts
└── index.ts                       # Export all Firebase services
```

### Utils Structure (`src/utils/`)

```
utils/
├── validation/
│   ├── authValidation.ts
│   ├── propertyValidation.ts
│   ├── bookingValidation.ts
│   └── index.ts
├── formatting/
│   ├── dateFormatting.ts
│   ├── priceFormatting.ts
│   ├── textFormatting.ts
│   └── index.ts
├── helpers/
│   ├── arrayHelpers.ts
│   ├── objectHelpers.ts
│   ├── stringHelpers.ts
│   └── index.ts
├── constants/
│   ├── apiConstants.ts
│   ├── uiConstants.ts
│   ├── appConstants.ts
│   └── index.ts
└── index.ts                       # Export all utilities
```

### Lib Structure (`src/lib/`)

```
lib/
├── react-query/
│   ├── queryClient.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── index.ts
├── zustand/
│   ├── authStore.ts
│   ├── propertyStore.ts
│   ├── bookingStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── maps/
│   ├── mapboxConfig.ts
│   ├── mapHelpers.ts
│   └── index.ts
├── payment/
│   ├── stripeConfig.ts
│   ├── paymentHelpers.ts
│   └── index.ts
├── analytics/
│   ├── analyticsConfig.ts
│   ├── trackingEvents.ts
│   └── index.ts
└── index.ts                       # Export all lib integrations
```

### Styles Structure (`src/styles/`)

```
styles/
├── globals.css                    # Global CSS styles
├── components.css                 # Component-specific styles
├── utilities.css                  # Custom utility classes
├── animations.css                 # Custom animations
└── themes/
    ├── light.css
    ├── dark.css
    └── index.ts
```

### Assets Structure (`src/assets/`)

```
assets/
├── images/
│   ├── logos/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── favicon.ico
│   ├── illustrations/
│   │   ├── empty-state.svg
│   │   ├── error-404.svg
│   │   └── welcome.svg
│   └── placeholders/
│       ├── property-placeholder.jpg
│       ├── avatar-placeholder.svg
│       └── image-placeholder.svg
├── icons/
│   ├── social/
│   │   ├── facebook.svg
│   │   ├── google.svg
│   │   └── apple.svg
│   └── ui/
│       ├── arrow-right.svg
│       ├── check.svg
│       └── close.svg
└── fonts/
    ├── Inter/
    │   ├── Inter-Regular.woff2
    │   ├── Inter-Medium.woff2
    │   └── Inter-Bold.woff2
    └── index.css
```

## File Naming Conventions

### Component Files
- **Components**: PascalCase (e.g., `PropertyCard.tsx`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `PropertyCard.types.ts`)
- **Tests**: PascalCase with `.test.tsx` suffix (e.g., `PropertyCard.test.tsx`)
- **Stories**: PascalCase with `.stories.tsx` suffix (e.g., `PropertyCard.stories.tsx`)

### Utility Files
- **Utilities**: camelCase (e.g., `dateFormatting.ts`)
- **Constants**: camelCase with `Constants` suffix (e.g., `apiConstants.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)

### Configuration Files
- **Config**: camelCase with `Config` suffix (e.g., `firebaseConfig.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `authService.ts`)

## Import/Export Patterns

### Barrel Exports
Each directory includes an `index.ts` file for clean imports:

```typescript
// src/components/ui/index.ts
export { 
  Button, 
  Input, 
  Card, 
  Modal, 
  Avatar,
  Badge,
  Dropdown,
  Navbar
} from '@heroui/react'

// src/components/shared/index.ts
export { PropertyCard } from './PropertyCard'
export { SearchBar } from './SearchBar'
export { DatePicker } from './DatePicker'
// ... other exports

// Usage in other files
import { Button, Input, Card } from '@/components/ui'
import { PropertyCard, SearchBar } from '@/components/shared'
```

### Absolute Imports
Configure path mapping in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/lib/*": ["src/lib/*"],
      "@/firebase/*": ["src/firebase/*"]
    }
  }
}
```

## Development Workflow

### Component Development
1. Determine if Hero UI component exists for the need
2. If Hero UI component exists, use it directly with customization
3. If custom component needed, create in appropriate directory (shared/features/layout)
4. Implement component with TypeScript interfaces
5. Add unit tests
6. Create Storybook stories (if applicable)
7. Export from index file
8. Update parent index file

### Feature Development
1. Create necessary hooks in `src/hooks/`
2. Implement Firebase services in `src/firebase/`
3. Create page components in `src/pages/`
4. Add routing configuration
5. Update documentation

## Build and Deployment

### Build Structure
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [asset-files]
├── index.html
└── [static-assets]
```

### Environment Configuration
```
.env.local                         # Local development
.env.development                   # Development environment
.env.staging                       # Staging environment
.env.production                    # Production environment
```

This project structure ensures maintainability, scalability, and follows modern React/TypeScript best practices while supporting the mobile-first, Instagram-inspired design approach of Nomad Lux. 