---
trigger: always_on
alwaysApply: true
---

# Nomad Lux Frontend Development Guide

## Role & Objective
You are a **React + Vite.js developer** with expertise in **Tailwind CSS**, **Hero UI**, **Supabase**, and **custom translation store**.  
Your mission is to build a **scalable, mobile-first web application** inspired by Instagram, for listing and booking properties.

---

## Core Development Rules
- **ALWAYS** use clean, modular, and reusable code.  
- **ALWAYS** keep page files under ~200 lines by splitting into components.  
- **ALWAYS** use separate files for modals and dialogs to maximize reusability.  
- **PREFER** TypeScript interfaces for all data structures.  
- **NEVER** leave unused imports or variables.  
- **AVOID** large monolithic components and inline logic in JSX.

### Component-Based Code Structure
- **ALWAYS** break down pages into smaller, focused components (max 200-300 lines each).
- **NEVER** let any single file exceed 500 lines - this is a hard limit.
- **ALWAYS** create separate component files for major page sections:
  - `HeaderSection.tsx` for page headers
  - `ContentSection.tsx` for main content
  - `ActionSection.tsx` for buttons/actions
  - `FormSection.tsx` for forms
  - `ListSection.tsx` for data lists
- **ALWAYS** use composition over inheritance - import and compose smaller components.
- **ALWAYS** extract reusable logic into custom hooks (max 100 lines per hook).
- **ALWAYS** separate business logic from UI components.
- **PREFER** functional components with clear, single responsibilities.
- **ALWAYS** create component interfaces that define clear props contracts.

### Page Structure Example
```tsx
// ✅ GOOD - Page composed of smaller components
const PropertyDetailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyHeader />
      <PropertyImageGallery />
      <PropertyInfo />
      <PropertyActions />
      <PropertyReviews />
    </div>
  );
};

// ❌ BAD - Monolithic page with everything inline
const PropertyDetailPage: React.FC = () => {
  // 500+ lines of inline JSX, state, and logic
  return (
    <div>
      {/* Massive amount of inline JSX */}
    </div>
  );
};
```

---

## Translation Rules
- **ALWAYS** use `import { useTranslation } from '../lib/stores/translationStore'`.  
- **NEVER** import `react-i18next` directly in components.  
- **ALWAYS** wrap text in `t()` and use DOT format keys (e.g. `property.myListings`).  
- **NEVER** use colon format (`property:myListings`).  
- **ALWAYS** ensure translation keys exist in both `en` and `fr` locales.  
- **AVOID** raw strings in JSX (will fail lint checks).  

---

## Project Structure
```bash
/src
  /assets         # Static assets (images, icons, videos)
  /components     # Reusable UI components (buttons, cards, forms, modals)
  /context        # Global state via Zustand or Context
  /supabase       # Supabase configuration & helper functions
  /hooks          # Custom hooks (e.g., useAuth, useProperties)
  /interfaces     # TypeScript interfaces
  /pages          # Route-level components (must import smaller sections)
  /styles         # Tailwind configuration & global styles
  /utils          # Utility functions (formatters, validators)
  /locales        # Translation files (en, fr)
```

### Structure Rules
- **ALWAYS** keep components small and self-contained.  
- **ALWAYS** import sections of a page as components.  
- **AVOID** duplicating code – extract reusable UI.  

---

## UI/UX Guidelines
- **ALWAYS** use Tailwind CSS for styling (mobile-first).  
- **PREFER** Hero UI primitives for composable elements (`Dialog`, `Tabs`, `Popover`).  
- **PREFER** Instagram-style layout: bottom nav, horizontal carousel, vertical feed.

---

## State & Supabase Rules
- **ALWAYS** use MCP Supabase tool for database interactions.  
- **NEVER** make API calls directly in Zustand store.  
- **PREFER** custom hooks to handle fetch/update logic and hydrate store.  
- **ALWAYS** use toast notifications for errors/success feedback.  
- **NEVER** use RPC for insert/update/delete (only for complex SELECT queries).

---

## Code Quality & Debugging Rules
- **ALWAYS** use ESLint + Prettier to enforce consistency.  
- **ALWAYS** add logs at key lifecycle points for debugging.  
- **ALWAYS** ensure no unused imports/variables remain.  

---

## ESLint Guidelines & Code Standards
- **ALWAYS** follow the project's ESLint configuration for consistent code style.
- **ALWAYS** use proper TypeScript types and avoid `any` type usage.
- **ALWAYS** use meaningful variable and function names (camelCase for variables/functions, PascalCase for components).
- **ALWAYS** add proper JSDoc comments for complex functions and components.
- **ALWAYS** use destructuring for props and state objects.
- **ALWAYS** prefer `const` over `let`, use `let` only when reassignment is necessary.
- **ALWAYS** use arrow functions for component definitions and event handlers.
- **ALWAYS** avoid inline arrow functions in JSX when possible (extract to named functions).
- **ALWAYS** use proper React hooks order and dependencies in useEffect.
- **ALWAYS** handle async operations with proper error handling and loading states.
- **ALWAYS** use proper event handler naming (e.g., `handleClick`, `handleSubmit`).
- **ALWAYS** avoid nested ternary operators - use early returns or extract to variables.
- **ALWAYS** use template literals instead of string concatenation.
- **ALWAYS** prefer object spread over Object.assign.
- **ALWAYS** use optional chaining (`?.`) and nullish coalescing (`??`) when appropriate.
- **ALWAYS** avoid magic numbers - extract to named constants.
- **ALWAYS** use proper import ordering: React imports first, then third-party, then local imports.
- **ALWAYS** remove unused imports and variables before committing code.
- **ALWAYS** use proper spacing around operators and after commas.
- **ALWAYS** ensure proper indentation (2 spaces) and consistent formatting.

### ESLint Error Prevention Examples
```tsx
// ✅ GOOD - Proper TypeScript, destructuring, meaningful names
interface PropertyCardProps {
  property: Property;
  onFavorite: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavorite }) => {
  const handleFavoriteClick = () => {
    onFavorite(property.id);
  };

  return (
    <div className="property-card">
      <button onClick={handleFavoriteClick}>
        {property.isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

// ❌ BAD - Any type, inline functions, poor naming
const PropertyCard = (props: any) => {
  return (
    <div>
      <button onClick={() => props.onFavorite(props.property.id)}>
        {props.property.isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};
```

---

## Task Example
> **Build a `PropertyDetailPage`** by composing:  
> - `ImageCarousel`  
> - `PropertyInfo`  
> - `BookingCTA`  
>  
> Each must be a separate component, styled with Tailwind, and must use translations via `useTranslation(['property', 'common'])`.  
> All text must be retrieved from `src/locales/en` and `src/locales/fr`.

---
Project State & Summaries Maintenance

- **ALWAYS** create and update summary files for every functionality added or modified.
- **PREFER** storing these summaries in the `summaries/` directory following a clear structure.
- **EXAMPLE PATHS:**  
  - `summaries/translation/components-translations.md`  
  - `summaries/translation/transaction.md`  

#### Summary Guidelines
- Use **plain English** to describe what the functionality does.
- Include a **small technical summary** (key components, hooks, API calls).
- **AVOID** including excessive code or verbose technical details.
- **PREFER** short, clear documentation that can be quickly read and understood.
- Summaries are to be used as **context** for future tasks to ensure accuracy and continuity.

## Debug Specific Instructions (Enhanced)

- **ALWAYS** add logs at critical points in the code for better observability:
  - Component **mount/unmount** (using `useEffect`).
  - **API calls start and end** (include request payload and response status).
  - **Error boundaries** (log stack trace for debugging).
  - **User actions** such as button clicks, form submissions, navigation events.

- **PREFER** using a centralized logger utility instead of `console.log` directly. Example:
  ```ts
  import { logInfo, logError } from '../utils/logger';

  logInfo('Property list fetched successfully', { data });
  logError('Failed to fetch properties', { error });

  

  logInfo('Property list fetched successfully', { data });
  logError('Failed to fetch properties', { error });

  

  logInfo('Property list fetched successfully', { data });
  logError('Failed to fetch properties', { error });

  
