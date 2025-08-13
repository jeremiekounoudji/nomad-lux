# PRD: Comprehensive Translation Verification

## Introduction/Overview

This PRD outlines a systematic approach to verify and confirm that all components and pages in the Nomad Lux application properly implement translations according to the established translation blueprint. The goal is to ensure consistency, eliminate hardcoded strings, and prevent "dot words" from appearing in the UI.

**Problem Statement**: Despite having a working translation blueprint, there may be inconsistencies across the codebase where some components don't follow the established patterns, leading to translation issues and poor user experience.

**Goal**: Achieve 100% compliance with the translation blueprint across all components and pages, ensuring a consistent and reliable translation system.

## Goals

1. **Verify Blueprint Compliance**: Ensure all components follow the established translation patterns from `translation-blueprint.md`
2. **Eliminate Hardcoded Strings**: Remove any remaining hardcoded text from components
3. **Prevent "Dot Words"**: Ensure no raw translation keys appear in the UI
4. **Maintain Working Code**: Preserve existing working implementations without breaking them
5. **Document Progress**: Track verification progress and maintain implementation summary

## User Stories

1. **As a developer**, I want all components to follow the same translation pattern so that I can maintain consistency across the codebase.

2. **As a user**, I want all text to be properly translated so that I can use the application in my preferred language without seeing technical errors.

3. **As a QA tester**, I want to verify that language switching works correctly across all pages so that I can ensure a complete multilingual experience.

4. **As a project manager**, I want to track translation implementation progress so that I can ensure the feature is fully delivered.

## Functional Requirements

### 1. Translation Store Usage Verification
- The system must verify that all components use `import { useTranslation } from '../lib/stores/translationStore'`
- The system must confirm no components use `react-i18next` directly
- The system must ensure no hardcoded strings exist in any component

### 2. Namespace Declaration Verification
- The system must verify proper namespace usage in `useTranslation` hooks
- The system must confirm single namespace usage: `useTranslation('property')`
- The system must confirm multiple namespace usage: `useTranslation(['property', 'common'])`

### 3. Translation Key Format Verification
- The system must verify DOT format usage for cross-namespace calls: `t('property.myListings')`
- The system must confirm explicit namespace format: `t('property:myListings')`
- The system must ensure no colon format usage that causes "dot words": `t('property:myListings')`

### 4. Translation File Structure Verification
- The system must verify all translation keys exist in both English and French files
- The system must confirm proper key structure in JSON files
- The system must ensure no missing translation keys

### 5. Component Categorization and Verification
- The system must verify all page components (HomePage, PropertyDetailPage, etc.)
- The system must verify all shared components (PropertyCard, PageBanner, etc.)
- The system must verify all feature components (admin, booking, property, etc.)
- The system must verify all modal components

### 6. Progress Tracking and Documentation
- The system must update `translation-implementation-summary.md` with verification progress
- The system must document any issues found during verification
- The system must track files that are working correctly vs. those needing fixes

## Non-Goals (Out of Scope)

- Adding new translation keys unless missing
- Changing working translation implementations
- Modifying the translation blueprint itself
- Adding new language support
- Performance optimization of translation loading
- Creating new translation patterns

## Design Considerations

### Translation Key Patterns to Verify
Based on the working blueprint, verify these specific patterns:

1. **Page Banner Pattern**:
   ```typescript
   title={t('property.myListings')}
   subtitle={t('property.managePropertiesAndTrack')}
   imageAlt={t('common.pageBanner.myListings')}
   ```

2. **Tab/Button Pattern**:
   ```typescript
   <Tab title={`${t('property.listings.tabs.all')} (${count})`} />
   <Button>{t('property.listings.actions.edit')}</Button>
   ```

3. **Cross-Namespace Pattern**:
   ```typescript
   const { t } = useTranslation(['property', 'common'])
   t('property.myListings')        // ✅ Works
   t('common.pageBanner.home')     // ✅ Works
   ```

## Technical Considerations

### Verification Process
1. **Use existing translation blueprint** as the source of truth
2. **Follow established patterns** that are confirmed working
3. **Avoid modifying working implementations** unless issues are found
4. **Update implementation summary** after each file verification

### Dependencies
- Existing translation store: `src/lib/stores/translationStore.ts`
- Existing i18n configuration: `src/lib/i18n.ts`
- Existing translation files: `src/locales/en/` and `src/locales/fr/`

## Success Metrics

1. **100% Blueprint Compliance**: All components follow the established translation patterns
2. **Zero Hardcoded Strings**: No hardcoded text found in any component
3. **Zero "Dot Words"**: No raw translation keys appear in the UI
4. **Complete Translation Coverage**: All text elements use translation keys
5. **Bilingual Functionality**: All components work correctly in both English and French
6. **No Console Errors**: No translation-related errors in browser console
7. **Updated Documentation**: Implementation summary reflects current state

## Implementation Plan

### Phase 1: Page Components Verification
Verify all pages in `src/pages/` directory following user journey flow:
1. HomePage, PropertyDetailPage, SearchPage
2. MyListingsPage, MyBookingsPage, LikedPropertiesPage
3. CreatePropertyPage, BookingRequestsPage
4. LoginPage, RegisterPage, WalletPage
5. NotificationsPage, HelpPage, TermsPage
6. AdminPage, AdminLoginPage, AdminRegisterPage

### Phase 2: Shared Components Verification
Verify all components in `src/components/shared/` and `src/components/shared/modals/`

### Phase 3: Feature Components Verification
Verify all components in `src/components/features/` subdirectories

### Phase 4: Layout and Map Components Verification
Verify components in `src/components/layout/` and `src/components/map/`

### Phase 5: UI Components Verification
Verify all components in `src/components/ui/`

## Open Questions

1. **Priority Order**: Should we prioritize pages based on user journey flow or fix issues as we find them?
2. **Testing Strategy**: How should we test each component after verification to ensure no regressions?
3. **Documentation Level**: How detailed should the implementation summary be for each verified file?
4. **Issue Resolution**: Should we fix issues immediately during verification or batch them for later resolution?
5. **Blueprint Updates**: If we find patterns that work better than the current blueprint, should we update it?

## Acceptance Criteria

### For Each Component/Page:
- [ ] Uses correct translation store import
- [ ] No hardcoded strings present
- [ ] Uses proper namespace declaration
- [ ] Uses correct translation key format
- [ ] All translation keys exist in both language files
- [ ] No "dot words" appear in UI
- [ ] Language switching works correctly
- [ ] No console errors related to translations

### For Overall Project:
- [ ] All components verified and documented
- [ ] Implementation summary updated with current state
- [ ] No regressions introduced
- [ ] All translation keys verified
- [ ] Blueprint compliance achieved
- [ ] Success metrics met

## Timeline Estimate

- **Phase 1 (Pages)**: 2-3 days
- **Phase 2 (Shared Components)**: 1-2 days  
- **Phase 3 (Feature Components)**: 2-3 days
- **Phase 4 (Layout/Map)**: 1 day
- **Phase 5 (UI Components)**: 1 day
- **Documentation and Testing**: 1 day

**Total Estimated Time**: 8-11 days

## Success Definition

This project will be considered successful when:
1. All components and pages follow the translation blueprint
2. No hardcoded strings remain in the codebase
3. No "dot words" appear in the UI
4. All translation keys are properly implemented
5. Language switching works correctly across all components
6. Implementation summary accurately reflects the current state
7. No regressions are introduced to existing functionality 