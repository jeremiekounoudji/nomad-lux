# 🎨 UI Components System - Technical Documentation

## Overview
The UI Components system for Nomad Lux leverages Hero UI as the foundation component library, with custom components built on top for specific business needs, creating a consistent, accessible, and mobile-first design system.

## Technical Stack
- **Hero UI**: Base component library (Button, Input, Modal, etc.)
- **Tailwind CSS**: Styling and responsive design
- **Framer Motion**: Animations and transitions
- **React Hook Form**: Form handling
- **TypeScript**: Type safety for components

## Component Architecture

### Hero UI + Custom Components Structure
```
src/components/
├── ui/              # Hero UI components (imported from @heroui/react)
│   ├── Button       # Hero UI Button
│   ├── Input        # Hero UI Input
│   ├── Modal        # Hero UI Modal
│   ├── Card         # Hero UI Card
│   ├── Avatar       # Hero UI Avatar
│   └── ...          # Other Hero UI components
├── shared/          # Reusable custom components
│   ├── PropertyCard/
│   ├── SearchBar/
│   ├── DatePicker/
│   ├── ImageUpload/
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

## Hero UI Base Components

### Using Hero UI Components
```typescript
import { 
  Button, 
  Input, 
  Card, 
  Modal, 
  Avatar, 
  Badge,
  Spinner,
  Dropdown,
  Tabs,
  Switch
} from '@heroui/react'

// Hero UI components are used directly with their built-in props and styling
// We customize them using Tailwind classes and Hero UI's variant system

// Example: Using Hero UI Button
<Button 
  color="primary" 
  variant="solid" 
  size="md"
  isLoading={loading}
  startContent={<Icon />}
>
  Book Now
</Button>

// Example: Using Hero UI Input
<Input
  type="email"
  label="Email"
  placeholder="Enter your email"
  variant="bordered"
  isInvalid={!!error}
  errorMessage={error}
  startContent={<MailIcon />}
/>

// Example: Using Hero UI Card
<Card className="max-w-[400px]">
  <CardHeader>
    <h4>Property Details</h4>
  </CardHeader>
  <CardBody>
    <p>Property description...</p>
  </CardBody>
</Card>
```

## Custom Shared Components

### 1. Property Card Component
```typescript
import { Card, CardBody, CardHeader, Button, Badge, Avatar } from '@heroui/react'
import { Heart, Star, Share } from 'lucide-react'

interface PropertyCardProps {
  property: Property
  variant?: 'grid' | 'list' | 'story'
  onLike?: (propertyId: string) => void
  onShare?: (property: Property) => void
  onBook?: (property: Property) => void
  className?: string
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'grid',
  onLike,
  onShare,
  onBook,
  className
}) => {
  const [isLiked, setIsLiked] = useState(false)
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(property.id)
  }
  
  return (
    <Card 
      className={cn(
        'hover:scale-105 transition-transform duration-200',
        variant === 'story' && 'min-w-[280px] snap-center',
        className
      )}
      isPressable
    >
      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
        <Badge color="secondary" variant="flat">
          {property.type}
        </Badge>
        <Button
          isIconOnly
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
          variant="flat"
          size="sm"
          onClick={handleLike}
        >
          <Heart
            className={cn('w-4 h-4', isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600')}
          />
        </Button>
      </CardHeader>
      
      <div className="relative">
        <img
          src={property.media.images[0]}
          alt={property.title}
          className={cn(
            'object-cover w-full',
            variant === 'grid' && 'h-48',
            variant === 'list' && 'h-32',
            variant === 'story' && 'h-56'
          )}
        />
      </div>
      
      <CardBody className="px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">
              {property.ratings.average.toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.location.city}, {property.location.country}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold">${property.price}</span>
            <span className="text-sm text-gray-500">per night</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => onShare?.(property)}
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              color="primary"
              onClick={() => onBook?.(property)}
            >
              Book
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
```

### 2. Search Bar Component
```typescript
import { Input, Button, Card, CardBody } from '@heroui/react'
import { Search, Filter } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  placeholder?: string
  showFilters?: boolean
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search destinations...",
  showFilters = true,
  className
}) => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  const handleSearch = () => {
    onSearch(query, filters)
  }
  
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  return (
    <div className={cn('relative', className)}>
      <Card className="shadow-lg">
        <CardBody className="flex-row items-center gap-2 p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            startContent={<Search className="w-5 h-5 text-gray-400" />}
            variant="flat"
            className="flex-1"
            classNames={{
              input: "border-none bg-transparent",
              inputWrapper: "border-none bg-transparent shadow-none"
            }}
          />
          
          {showFilters && (
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              startContent={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>
          )}
          
          <Button
            color="primary"
            onClick={handleSearch}
            className="px-6"
          >
            Search
          </Button>
        </CardBody>
      </Card>
      
      {showFilterPanel && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardBody className="p-6">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApply={() => {
                handleSearch()
                setShowFilterPanel(false)
              }}
            />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
```

## Feature-Specific Components

### 1. Navigation Bar
```typescript
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Home, Search, Calendar, Heart, User } from 'lucide-react'

const NavigationBar: React.FC = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Liked', href: '/liked', icon: Heart },
    { name: 'Profile', href: '/profile', icon: User }
  ]
  
  return (
    <>
      {/* Desktop Navigation */}
      <Navbar className="hidden md:flex" maxWidth="xl">
        <NavbarBrand>
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold">Nomad Lux</span>
          </Link>
        </NavbarBrand>
        
        <NavbarContent className="hidden md:flex gap-8" justify="center">
          {navigation.slice(0, -1).map((item) => (
            <NavbarItem key={item.name} isActive={location.pathname === item.href}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  location.pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        
        <NavbarContent justify="end">
          {user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  src={user.avatar}
                  name={user.displayName}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile">
                  <Link to="/profile">Profile</Link>
                </DropdownItem>
                <DropdownItem key="settings">Settings</DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={signOut}>
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              <Button variant="light" as={Link} to="/auth/login">
                Sign In
              </Button>
              <Button color="primary" as={Link} to="/auth/register">
                Sign Up
              </Button>
            </div>
          )}
        </NavbarContent>
      </Navbar>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-divider z-50">
        <div className="flex justify-around items-center py-2">
          {navigation.map((item) => (
            <Button
              key={item.name}
              as={Link}
              to={item.href}
              variant="light"
              className={cn(
                'flex flex-col items-center h-auto py-2 px-3',
                location.pathname === item.href && 'text-primary'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}
```

## Layout Components

### 1. Main Layout
```typescript
import { NextUIProvider } from '@heroui/react'

interface MainLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
  showFooter?: boolean
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showNavigation = true,
  showFooter = true
}) => {
  return (
    <NextUIProvider>
      <div className="min-h-screen bg-background">
        {showNavigation && <NavigationBar />}
        
        <main className={cn(
          'flex-1',
          showNavigation && 'pt-16 md:pt-0',
          showNavigation && 'pb-20 md:pb-0' // Account for mobile bottom nav
        )}>
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </NextUIProvider>
  )
}
```

## Design System Tokens

### 1. Color Palette
```typescript
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    600: '#4b5563',
    900: '#111827'
  },
  success: {
    500: '#10b981',
    600: '#059669'
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706'
  },
  error: {
    500: '#ef4444',
    600: '#dc2626'
  }
}
```

### 2. Typography Scale
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
}
```

## Responsive Design

### 1. Breakpoint System
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Usage in components
const ResponsiveGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {/* Grid items */}
  </div>
)
```

### 2. Mobile-First Approach
```typescript
// Mobile-first utility classes
const mobileFirstClasses = {
  // Start with mobile styles, then add larger breakpoints
  container: 'px-4 sm:px-6 lg:px-8',
  text: 'text-sm sm:text-base lg:text-lg',
  spacing: 'p-4 sm:p-6 lg:p-8',
  grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}
```

## Accessibility Features

### 1. ARIA Support
```typescript
const AccessibleButton: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    role="button"
    aria-label={props['aria-label']}
    aria-describedby={props['aria-describedby']}
    tabIndex={props.disabled ? -1 : 0}
    {...props}
  >
    {children}
  </button>
)
```

### 2. Keyboard Navigation
```typescript
const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          onSelect(items[selectedIndex])
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onSelect])
  
  return selectedIndex
}
```

This UI Components system provides a comprehensive, accessible, and maintainable design system that ensures consistency across the entire Nomad Lux platform. 