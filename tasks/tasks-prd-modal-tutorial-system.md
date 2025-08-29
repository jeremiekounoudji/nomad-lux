# Task List: Modal-Based Tutorial System

## Relevant Files

- `src/components/shared/TutorialModal.tsx` - Main tutorial modal component with navigation and content display
- `src/components/shared/TutorialModal.test.tsx` - Unit tests for TutorialModal component
- `src/components/shared/TutorialStep.tsx` - Individual tutorial step component for each of the 4 steps
- `src/components/shared/TutorialStep.test.tsx` - Unit tests for TutorialStep component
- `src/components/shared/TutorialProgress.tsx` - Progress bar and dots indicator component
- `src/components/shared/TutorialProgress.test.tsx` - Unit tests for TutorialProgress component
- `src/hooks/useTutorial.ts` - Custom hook for tutorial state management and user preferences
- `src/hooks/useTutorial.test.ts` - Unit tests for useTutorial hook
- `src/lib/stores/tutorialStore.ts` - Zustand store for tutorial state and user preferences
- `src/lib/stores/tutorialStore.test.ts` - Unit tests for tutorialStore
- `src/pages/HomePage.tsx` - Integration point where tutorial is triggered on first visit
- `src/pages/HomePage.test.tsx` - Unit tests for HomePage tutorial integration
- `src/locales/en/tutorial.json` - English translation keys for tutorial content
- `src/locales/fr/tutorial.json` - French translation keys for tutorial content
- `src/assets/tutorial/` - Directory containing tutorial screenshots and images
- `src/utils/tutorialUtils.ts` - Utility functions for tutorial logic and analytics
- `src/utils/tutorialUtils.test.ts` - Unit tests for tutorial utilities
- `src/interfaces/Tutorial.ts` - TypeScript interfaces for tutorial data structures


### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `TutorialModal.tsx` and `TutorialModal.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Create Tutorial State Management System
  - [x] 1.1 Create TypeScript interfaces for tutorial data structures in `src/interfaces/Tutorial.ts`
  - [x] 1.2 Create Zustand store for tutorial state management in `src/lib/stores/tutorialStore.ts`
  - [x] 1.3 Implement tutorial state persistence with user preferences
  - [x] 1.4 Create custom hook `useTutorial` for tutorial state management
  - [x] 1.5 Add tutorial completion tracking and "never show again" functionality
  - [x] 1.6 Write unit tests for tutorialStore and useTutorial hook

- [x] 2.0 Build Core Tutorial Modal Components
  - [x] 2.1 Create main TutorialModal component with full-screen overlay
  - [x] 2.2 Implement TutorialStep component for individual step display
  - [x] 2.3 Create TutorialProgress component with progress bar and dots indicator
  - [x] 2.4 Add navigation controls (Previous/Next buttons) with step counter
  - [x] 2.5 Implement close button and skip functionality
  - [x] 2.6 Add "Never show again" checkbox with proper state management
  - [x] 2.7 Implement responsive design for mobile and desktop
  - [x] 2.8 Add keyboard navigation and accessibility features
  - [x] 2.9 Write unit tests for all tutorial components

- [x] 3.0 Implement Tutorial Content and Assets
  - [x] 3.1 Create tutorial assets directory structure in `src/assets/tutorial/`
  - [x] 3.2 Capture and optimize screenshots for Step 1 (Booking Properties)
  - [x] 3.3 Capture and optimize screenshots for Step 2 (Property Creation)
  - [x] 3.4 Capture and optimize screenshots for Step 3 (Managing Self Bookings)
  - [x] 3.5 Capture and optimize screenshots for Step 4 (Booking Requests)
  - [x] 3.6 Add visual highlights and arrows to tutorial images
  - [x] 3.7 Create tutorial content configuration with step data
  - [x] 3.8 Implement image loading and optimization utilities

- [ ] 4.0 Integrate Tutorial with Homepage and User Flow
  - [ ] 4.1 Modify HomePage component to check for first-time user visit
  - [ ] 4.2 Implement tutorial trigger logic on homepage load
  - [ ] 4.3 Add tutorial modal integration to HomePage component
  - [ ] 4.4 Implement user preference checking for tutorial display
  - [ ] 4.5 Add tutorial state management to user onboarding flow
  - [ ] 4.6 Test tutorial integration with different user scenarios
  - [ ] 4.7 Write unit tests for HomePage tutorial integration

- [ ] 5.0 Add Translation Support and Analytics Integration
  - [ ] 5.1 Create English translation file `src/locales/en/tutorial.json`
  - [ ] 5.2 Create French translation file `src/locales/fr/tutorial.json`
  - [ ] 5.3 Integrate translation system with tutorial components using DOT format
  - [ ] 5.4 Add translation keys for all tutorial content (titles, descriptions, buttons)
  - [ ] 5.5 Implement analytics tracking for tutorial events (start, step completion, skip, finish)
  - [ ] 5.6 Create tutorial analytics utility functions
  - [ ] 5.7 Add analytics events for tutorial completion rates and user engagement
  - [ ] 5.8 Test translation functionality in both English and French
  - [ ] 5.9 Write unit tests for translation integration and analytics tracking
