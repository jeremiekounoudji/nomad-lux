# Design Document

## Overview

The home tutorial modal is an onboarding feature that introduces new users to the Nomad Lux platform through a guided 4-step walkthrough. The modal will be implemented as a React component using Hero UI's Modal system, with a custom tutorial store for state management and proper translation support following the established blueprint pattern.

## Architecture

### Component Structure
```
TutorialModal/
├── TutorialModal.tsx          # Main modal component
├── TutorialStep.tsx           # Individual step component
├── TutorialProgress.tsx       # Progress dots component
├── TutorialNavigation.tsx     # Next/Previous buttons
└── index.ts                   # Exports
```

### State Management
- **Tutorial Store**: Zustand store to manage tutorial state (current step, completion status, visibility)
- **Local Storage**: Persist tutorial completion status to prevent showing again
- **Translation Store**: Use existing translation system with new 'tutorial' namespace

### Integration Points
- **HomePage Component**: Integrate tutorial trigger and modal rendering
- **Translation System**: Add tutorial translations following blueprint pattern
- **Local Storage**: Store user preferences for tutorial completion

## Components and Interfaces

### TutorialModal Component
```typescript
interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  image: string;
  titleKey: string;
  descriptionKey: string;
  imageAlt: string;
}
```

### Tutorial Store Interface
```typescript
interface TutorialState {
  currentStep: number;
  isCompleted: boolean;
  isVisible: boolean;
  totalSteps: number;
  
  // Actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeTutorial: () => void;
  showTutorial: () => void;
  hideTutorial: () => void;
  resetTutorial: () => void;
}
```

### Tutorial Steps Configuration
```typescript
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    image: '/images/tutorial/booking-step.jpg',
    titleKey: 'tutorial.steps.booking.title',
    descriptionKey: 'tutorial.steps.booking.description',
    imageAlt: 'tutorial.steps.booking.imageAlt'
  },
  {
    id: 2,
    image: '/images/tutorial/create-property-step.jpg',
    titleKey: 'tutorial.steps.createProperty.title',
    descriptionKey: 'tutorial.steps.createProperty.description',
    imageAlt: 'tutorial.steps.createProperty.imageAlt'
  },
  {
    id: 3,
    image: '/images/tutorial/manage-bookings-step.jpg',
    titleKey: 'tutorial.steps.manageBookings.title',
    descriptionKey: 'tutorial.steps.manageBookings.description',
    imageAlt: 'tutorial.steps.manageBookings.imageAlt'
  },
  {
    id: 4,
    image: '/images/tutorial/booking-requests-step.jpg',
    titleKey: 'tutorial.steps.bookingRequests.title',
    descriptionKey: 'tutorial.steps.bookingRequests.description',
    imageAlt: 'tutorial.steps.bookingRequests.imageAlt'
  }
];
```

## Data Models

### Tutorial Completion Tracking
```typescript
interface TutorialPreferences {
  isCompleted: boolean;
  completedAt?: string;
  version: string; // For future tutorial updates
}
```

### Local Storage Schema
```typescript
// Key: 'nomad-lux-tutorial-preferences'
{
  isCompleted: boolean;
  completedAt: "2025-01-13T10:30:00Z";
  version: "1.0.0";
}
```

## Error Handling

### Image Loading Errors
- Implement fallback images for each tutorial step
- Show placeholder with icon if images fail to load
- Log errors for monitoring

### Translation Errors
- Fallback to English if translation keys are missing
- Show generic text if both languages fail
- Graceful degradation for missing translations

### Storage Errors
- Handle localStorage unavailability (private browsing)
- Fallback to session storage or memory storage
- Don't block tutorial functionality if storage fails

## Testing Strategy

### Unit Tests
- **TutorialModal Component**: Rendering, step navigation, completion flow
- **Tutorial Store**: State transitions, persistence, reset functionality
- **TutorialStep Component**: Content rendering, image loading, accessibility
- **TutorialProgress Component**: Progress indication, click navigation

### Integration Tests
- **HomePage Integration**: Tutorial trigger on first visit, completion persistence
- **Translation Integration**: All tutorial keys render correctly in both languages
- **Storage Integration**: Preferences persist across browser sessions

### Accessibility Tests
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: ARIA labels and descriptions work correctly
- **Focus Management**: Proper focus trapping within modal
- **Color Contrast**: All text meets WCAG guidelines

### User Experience Tests
- **First Visit Flow**: Tutorial appears automatically for new users
- **Completion Flow**: Tutorial doesn't reappear after completion
- **Manual Access**: Users can re-access tutorial from help section
- **Responsive Design**: Works correctly on mobile and desktop

## Implementation Details

### Modal Styling
```scss
.tutorial-modal {
  max-width: 800px;
  width: 90vw;
  max-height: 90vh;
  
  .tutorial-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
  }
  
  .tutorial-progress {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
    
    .progress-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &.active {
        background-color: var(--primary-500);
      }
      
      &.inactive {
        background-color: var(--gray-300);
      }
    }
  }
}
```

### Translation Keys Structure
```json
// src/locales/en/tutorial.json
{
  "modal": {
    "title": "Welcome to Nomad Lux",
    "skipTutorial": "Skip Tutorial",
    "close": "Close"
  },
  "navigation": {
    "next": "Next",
    "previous": "Previous",
    "getStarted": "Get Started",
    "stepOf": "Step {{current}} of {{total}}"
  },
  "steps": {
    "booking": {
      "title": "Discover & Book Properties",
      "description": "Browse luxury properties, view detailed information, and book your perfect stay with our seamless booking system.",
      "imageAlt": "Property booking interface showing search and booking flow"
    },
    "createProperty": {
      "title": "List Your Property",
      "description": "Share your luxury property with travelers worldwide. Create detailed listings with photos, amenities, and pricing.",
      "imageAlt": "Property creation interface showing listing form and photo upload"
    },
    "manageBookings": {
      "title": "Manage Your Bookings",
      "description": "Track your reservations, view booking details, and communicate with hosts or guests from your bookings dashboard.",
      "imageAlt": "Bookings management dashboard showing reservation list and details"
    },
    "bookingRequests": {
      "title": "Handle Booking Requests",
      "description": "Review and respond to booking requests, manage your property availability, and communicate with potential guests.",
      "imageAlt": "Booking requests interface showing pending requests and response options"
    }
  }
}
```

### Store Implementation Pattern
```typescript
// Following existing store patterns in the project
export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      isCompleted: false,
      isVisible: false,
      totalSteps: 4,
      
      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      // ... other actions
    }),
    {
      name: 'nomad-lux-tutorial-preferences',
      partialize: (state) => ({
        isCompleted: state.isCompleted,
        completedAt: state.completedAt,
        version: '1.0.0'
      })
    }
  )
);
```

### HomePage Integration
```typescript
// Add to HomePage component
const { isCompleted, isVisible, showTutorial } = useTutorialStore();

useEffect(() => {
  // Show tutorial on first visit for authenticated users
  if (isAuthenticated && !isCompleted && !isVisible) {
    const timer = setTimeout(() => {
      showTutorial();
    }, 1000); // Small delay for better UX
    
    return () => clearTimeout(timer);
  }
}, [isAuthenticated, isCompleted, isVisible, showTutorial]);
```

## Performance Considerations

### Image Optimization
- Use WebP format with JPEG fallbacks
- Implement lazy loading for tutorial images
- Preload first step image for instant display
- Optimize image sizes for different screen densities

### Bundle Size
- Lazy load tutorial component to reduce initial bundle
- Use dynamic imports for tutorial-related code
- Minimize translation file size with efficient key structure

### Memory Management
- Clean up event listeners on component unmount
- Avoid memory leaks in tutorial store subscriptions
- Optimize re-renders with proper dependency arrays

## Security Considerations

### Data Privacy
- No sensitive user data stored in tutorial preferences
- Local storage data is non-sensitive completion status only
- No external API calls for tutorial functionality

### Content Security
- Validate image URLs to prevent XSS
- Sanitize any dynamic content in tutorial steps
- Use secure image hosting for tutorial assets

## Accessibility Features

### ARIA Support
```typescript
// Modal accessibility attributes
<Modal
  isOpen={isVisible}
  onClose={hideTutorial}
  aria-labelledby="tutorial-title"
  aria-describedby="tutorial-description"
  role="dialog"
  aria-modal="true"
>
```

### Keyboard Navigation
- Tab order: Close button → Progress dots → Navigation buttons
- Escape key closes modal
- Arrow keys navigate between steps
- Enter/Space activates buttons and progress dots

### Screen Reader Support
- Descriptive alt text for all images
- Live region announcements for step changes
- Clear labeling of interactive elements
- Progress indication in accessible format

## Future Enhancements

### Analytics Integration
- Track tutorial completion rates
- Monitor step drop-off points
- A/B test different tutorial content

### Personalization
- Show different tutorials based on user role (guest vs host)
- Skip steps based on user's previous actions
- Customize content based on user preferences

### Interactive Elements
- Add interactive hotspots on tutorial images
- Include mini-demos within tutorial steps
- Add video content for complex features