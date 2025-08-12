# Technology Stack & Build System

## Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **Styling**: Tailwind CSS with Hero UI component library
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **Maps**: Leaflet.js with OpenStreetMap integration
- **Animations**: Framer Motion
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast
- **Payment**: FedaPay React integration

## Backend & Services
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with role-based access control
- **Storage**: Supabase Storage for media files
- **Edge Functions**: Supabase Functions for server-side logic
- **Payment Processing**: FedaPay integration

## Development Tools
- **Package Manager**: npm
- **TypeScript**: Strict mode enabled with path aliases (@/*)
- **Linting**: ESLint with React and TypeScript rules
- **Code Quality**: Prettier for formatting
- **Environment**: Vite dev server with hot reload

## Key Dependencies
```json
{
  "@heroui/react": "UI component library",
  "@supabase/supabase-js": "Database and auth client",
  "react-router-dom": "Client-side routing",
  "zustand": "State management",
  "leaflet": "Map functionality",
  "framer-motion": "Animations",
  "fedapay-reactjs": "Payment processing",
  "react-hot-toast": "Notifications",
  "lucide-react": "Icon library"
}
```

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure Commands
```bash
# Path alias usage in imports
import Component from '@/components/Component'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/interfaces/User'
```

## Build Configuration
- **Vite Config**: Path aliases configured for @/* → ./src/*
- **TypeScript**: Strict mode with ES2020 target
- **Tailwind**: Hero UI plugin with custom color scheme
- **Bundle**: Code splitting and tree shaking enabled

## Environment Setup
- Environment variables prefixed with `VITE_`
- Supabase configuration in `src/lib/config.ts`
- Fallback configuration system for missing env files