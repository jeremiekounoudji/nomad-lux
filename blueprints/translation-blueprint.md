# Translation Blueprint

## Status
NEVER UPDATE AGAIN - WORKING

## Last Updated
2025-01-13 - CONFIRMED WORKING: DOT format (property.key) pattern works, added missing home.json and labels.json files

## Implementation Pattern

### 1. Translation Store Usage
- **ALWAYS** use custom translation store: `import { useTranslation } from '../lib/stores/translationStore'`
- **NEVER** use `react-i18next` directly in components
- **NEVER** use hardcoded strings

### 2. Namespace Declaration
```typescript
// Single namespace
const { t } = useTranslation('property')

// Multiple namespaces (first is default)
const { t } = useTranslation(['property', 'common'])
```

### 3. Translation Key Formats

#### For Single Namespace
```typescript
// When using useTranslation('property')
t('myListings')                    // ✅ Correct
t('listings.tabs.all')             // ✅ Correct
```

#### For Cross-Namespace Calls
```typescript
// When calling different namespace
t('common.pageBanner.home')        // ✅ Correct
t('property:myListings')           // ✅ Explicit namespace (recommended)
```

#### For Multiple Namespaces
```typescript
// When using useTranslation(['property', 'common'])
t('myListings')                    // ✅ Uses first namespace (property)
t('property:listings.tabs.all')   // ✅ Explicit namespace (recommended)
t('common.buttons.save')           // ✅ Cross-namespace call
```

### 4. Recommended Pattern (ALWAYS USE THIS)
**Use DOT format for cross-namespace calls (WORKING PATTERN FROM SEARCHPAGE):**
```typescript
const { t } = useTranslation(['property', 'common'])

// Use DOT format for cross-namespace calls (WORKING)
t('property.myListings')          // ✅ This works (SearchPage pattern)
t('property.listings.tabs.all')   // ✅ This works  
t('common.buttons.save')          // ✅ This works
t('common.pageBanner.home')       // ✅ This works

// NEVER use colon format (BROKEN)
t('property:myListings')          // ❌ This causes dot words
```

### 5. Translation File Structure
```
src/locales/
├── en/
│   ├── common.json
│   ├── property.json
│   ├── auth.json
│   ├── admin.json
│   ├── booking.json
│   ├── navigation.json
│   ├── notifications.json
│   ├── wallet.json
│   ├── help.json
│   ├── terms.json
│   ├── search.json
│   ├── profile.json
│   └── validation.json
└── fr/
    └── [same structure]
```

### 6. Key Addition Process
1. **Add to English file** first (`src/locales/en/[namespace].json`)
2. **Add to French file** (`src/locales/fr/[namespace].json`)
3. **Use explicit namespace format** in components
4. **Test in UI** to ensure no "dot words" appear

## File Structure
- **Translation Store**: `src/lib/stores/translationStore.ts`
- **i18n Config**: `src/lib/i18n.ts`
- **Translation Files**: `src/locales/[lang]/[namespace].json`
- **Components**: Import from translation store only

## Code Patterns

### Page Component Pattern
```typescript
import { useTranslation } from '../lib/stores/translationStore'

const MyPage: React.FC = () => {
  const { t } = useTranslation(['property', 'common'])
  
  return (
    <PageBanner
      title={t('property.myListings')}
      subtitle={t('property.managePropertiesAndTrack')}
      imageAlt={t('common.pageBanner.myListings')}
    />
  )
}
```

### Banner Component Pattern
```typescript
// For banners, use DOT format (SearchPage pattern)
title={t('property.submitYourProperty')}
subtitle={t('property.shareWithTravelers')}
imageAlt={t('common.pageBanner.createProperty')}
```

### Tab/Button Pattern
```typescript
// For UI elements, use DOT format
<Tab title={`${t('property.listings.tabs.all')} (${count})`} />
<Button>{t('property.listings.actions.edit')}</Button>
```

## Common Pitfalls

### ❌ DON'T DO THIS:
```typescript
// Wrong: react-i18next import
import { useTranslation } from 'react-i18next'

// Wrong: hardcoded strings
<h1>My Listings</h1>

// Wrong: colon format (causes dot words)
t('property:myListings')

// Wrong: relative keys without namespace (unreliable)
const { t } = useTranslation(['property', 'common'])
t('myListings') // May fail
```

### ✅ DO THIS:
```typescript
// Correct: custom store import
import { useTranslation } from '../lib/stores/translationStore'

// Correct: DOT format for cross-namespace (WORKING PATTERN)
const { t } = useTranslation(['property', 'common'])
t('property.myListings')        // ✅ Works like SearchPage
t('property.listings.tabs.all') // ✅ Works
t('common.pageBanner.home')     // ✅ Works
```

## Testing Checklist
1. **No "dot words"** in UI (raw translation keys)
2. **All text displays** properly in both English and French
3. **Language switching** works correctly
4. **No console errors** related to translations
5. **All namespaces** are properly loaded

## Common Translation Keys Structure

### Banner Keys (common.json)
```json
"pageBanner": {
  "alt": "Page banner background",
  "bannerLabel": "{{title}} page banner",
  "home": "Luxury property discovery background",
  "search": "Property search and discovery background",
  "createProperty": "Modern house architecture background",
  "myListings": "Property management background",
  "myBookings": "Travel and booking background",
  "likedProperties": "Favorite properties background",
  "bookingRequests": "Communication and requests background",
  "notifications": "Notifications and alerts background",
  "wallet": "Financial and wallet management background",
  "admin": "Admin dashboard and management background",
  "help": "Help and support background"
}
```

### Property Keys (property.json)
```json
{
  "myListings": "My Listings",
  "addListing": "Add Listing",
  "listings": {
    "tabs": {
      "all": "All",
      "approved": "Approved",
      "pending": "Pending",
      "paused": "Paused",
      "rejected": "Rejected"
    },
    "actions": {
      "pause": "Pause",
      "resume": "Resume",
      "stats": "Stats",
      "edit": "Edit",
      "delete": "Delete"
    }
  }
}
```

## Related Files
- `src/lib/stores/translationStore.ts` - Custom translation store
- `src/lib/i18n.ts` - i18n configuration  
- `src/hooks/useTranslationInit.ts` - Translation initialization
- `src/locales/en/*.json` - English translations
- `src/locales/fr/*.json` - French translations
- All page components that use translations

## Critical Success Factors
1. **Explicit namespace format** (`namespace:key`) prevents "dot words"
2. **Custom translation store** ensures consistency
3. **Proper key structure** in JSON files
4. **Both language files** must have matching keys
5. **No hardcoded strings** anywhere in components

This pattern has been tested and confirmed working. Do not deviate from this approach.
