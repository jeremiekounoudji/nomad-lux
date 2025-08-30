# Project Structure & Organization

## Root Directory Structure
```
nomad-lux/
├── docs/                     # Comprehensive documentation
├── src/                      # Source code
├── supabase/                 # Database migrations and functions
├── public/                   # Static assets
├── tasks/                    # Project requirements and tasks
├── .kiro/                    # Kiro AI assistant configuration
└── node_modules/             # Dependencies
```

## Source Code Organization (`src/`)
```
src/
├── components/               # React components
│   ├── features/            # Feature-specific components
│   │   ├── admin/           # Admin panel components
│   │   ├── auth/            # Authentication components
│   │   ├── booking/         # Booking system components
│   │   └── property/        # Property management components
│   ├── layout/              # Layout components (headers, navigation)
│   ├── map/                 # Map-related components
│   ├── shared/              # Reusable components across features
│   └── ui/                  # Base UI components (buttons, inputs)
├── hooks/                   # Custom React hooks
├── interfaces/              # TypeScript type definitions
├── lib/                     # Utilities and configurations
│   ├── stores/              # Zustand state stores
│   ├── config.ts            # App configuration
│   └── supabase.ts          # Supabase client setup
├── pages/                   # Page components for routing
├── router/                  # Routing configuration
│   ├── guards/              # Route protection logic
│   └── types/               # Router-specific types
├── styles/                  # Global styles and Tailwind config
└── utils/                   # Helper functions and utilities
```

## Component Architecture
- **Feature-Based Organization**: Components grouped by business domain
- **Atomic Design Principles**: UI components built from base to complex
- **Shared Components**: Reusable components across multiple features
- **Layout Components**: Consistent page layouts and navigation

## File Naming Conventions
- **Components**: PascalCase (e.g., `PropertyCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Interfaces**: PascalCase (e.g., `User.ts`, `Property.ts`)
- **Utilities**: camelCase (e.g., `priceCalculation.ts`)
- **Pages**: PascalCase with `Page` suffix (e.g., `HomePage.tsx`)

## Import Path Conventions
```typescript
// Use path aliases for cleaner imports
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/interfaces/User'
import { supabase } from '@/lib/supabase'
```

## Database Structure (`supabase/`)
```
supabase/
├── functions/               # Edge functions for server-side logic
└── migrations/              # Database schema migrations
```

## Documentation Structure (`docs/`)
- **Architecture**: System design and technical specifications
- **Features**: Individual feature documentation
- **API**: Database schema and function documentation
- **Setup**: Installation and configuration guides

## Key Architectural Patterns
- **Custom Hooks**: Business logic abstracted into reusable hooks
- **TypeScript Interfaces**: Strict typing for all data structures
- **Feature Modules**: Self-contained feature directories
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **State Management**: Zustand stores for global state, React state for local

## Mobile-First Considerations
- Components designed for mobile screens first
- Touch-friendly interactions and gestures
- Instagram-inspired UI patterns
- Bottom navigation for mobile navigation
- Responsive grid layouts for different screen sizes